from datetime import timedelta

from django_filters import rest_framework as filters
from django_filters.widgets import CSVWidget
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import OuterRef, Subquery, F

from django.core.exceptions import ValidationError
from django.db.models import Q, Sum
from django.db.models.functions import ExtractMonth
from django.utils import timezone
from django.utils.dateparse import parse_date
from collections import defaultdict

from ..models import Project, Record, User
from ..serializers import RecordSerializer
from ..permissions import IsOwnerOrTeamViewer


class RecordFilter(filters.FilterSet):
    queryset=User.objects.all()
    start_date = filters.IsoDateTimeFilter(field_name="date", lookup_expr='gte')
    end_date = filters.IsoDateTimeFilter(field_name="date", lookup_expr='lte')
    user_ids = filters.ModelMultipleChoiceFilter(
        queryset=queryset, field_name="user_id", widget=CSVWidget
    )
    
    class Meta:
        model = Record
        fields = ['user_id', 'project_id', 'date']


class RecordViewSet(viewsets.ModelViewSet):
    queryset = Record.objects.all()
    serializer_class = RecordSerializer
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = RecordFilter
    permission_classes=[IsAuthenticated, IsOwnerOrTeamViewer]
    
    @action(detail=False, methods=['GET'])
    def get_recent_projects(self, request):
        user_name = request.query_params.get('user_name')
        try:
            user = User.objects.get(user_name=user_name)
            self.check_object_permissions(request, user)
            user_id = user.id
            
            latest_record_per_project = (
                self.get_queryset()
                .filter(user_id=user_id, project_id=OuterRef("project_id"))
                .order_by("-id")
            )

            subquery = latest_record_per_project.values("id")[:1]

            latest_record_per_project_ordered = (
                Record.objects.select_related("project")
                .filter(id=Subquery(subquery))
                .order_by("-id")[:10]
            )

            result = latest_record_per_project_ordered.values(
                label=F("project__project_name"),
                value=F("project__id")
            )

            return Response(result)

        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
    
    @action(detail=False, methods=['GET'])
    #get sum of projects's working hours in current year
    def get_sum_hours_projects_in_year(self, request):
        current_year = timezone.now().year
        data = (
            Record.objects.values("project_id", month=ExtractMonth("date"))
            .filter(date__year=current_year)
            .order_by(-ExtractMonth("date"))
            .annotate(sum=Sum("working_hours"))
        )
        return Response(data)
    
    def list_dates(self, start, end):
        current = start
        while current <= end:
            yield current
            current += timedelta(days=1)

    @action(detail=False, methods=['GET'])
    def get_sum_hours_employees(self, request):
        user_ids = request.query_params.get("user_ids")
        user_ids = user_ids.split(",")
        for user_id in user_ids:
            self.check_object_permissions(request, User.objects.get(id=user_id))
        
        start_date = parse_date(request.query_params.get("start_date"))
        end_date = parse_date(request.query_params.get("end_date"))
        list_days = list(self.list_dates(start_date, end_date))

        query = Q(date__gte=start_date, date__lte=end_date, user_id__in=user_ids)
        records = self.get_queryset().values("user_id", "date").filter(query).order_by("-date").annotate(total_working_hours=Sum("working_hours"))        
        record_lookup = defaultdict(dict)
        result = []

        for r in records:
            user_id = int(r["user_id"])
            date = r["date"]
            record_lookup[user_id][date] = r["total_working_hours"]
            
        for user_id in user_ids:
            user_id = int(user_id)
            for date in list_days:
                hours = record_lookup.get(user_id, {}).get(date, 0)
                if (hours == 0 and date.weekday() < 5) or hours > 0:
                    result.append({
                        "user_id": user_id,
                        "date": date,
                        "total_working_hours": hours,
                    })
        result.sort(key=lambda x: x["date"], reverse=True)
        return Response(result)
            
    @action(detail=False, methods=['GET'])
    def get_sum_hours_projects(self, request):
        user_ids = request.query_params.get("user_ids")
        user_ids = user_ids.split(",")

        start_date = parse_date(request.query_params.get("start_date"))
        end_date = parse_date(request.query_params.get("end_date"))
        
        query = Q(date__gte=start_date, date__lte=end_date, user_id__in=user_ids)
        data = self.get_queryset().values("project").filter(query).annotate(total_working_hours=Sum("working_hours"))
        return Response(data)
        
    def validate_date(self, instance):
        current_month = timezone.now().month
        current_year = timezone.now().year

        target_month = (current_month - 2 + 12) % 12
        if target_month == 0:
            target_month = 12

        target_year = current_year if current_month > 2 else current_year - 1

        if not (
            instance.year > target_year
            or (instance.year == target_year and instance.month >= target_month)
        ):
            raise ValidationError(
                "Cannot create or edit records older than two months."
            )
     
    def validate_working_hours(self, instance):
        if instance > 24:
            raise ValidationError("Working hours can not be exceed than 24")
        elif instance <= 0:
            raise ValidationError("Invalid working hours")
    
    @action(detail=False, methods=['DELETE'])
    def batch_destroy(self, request):
        try:
            ids = request.data.get('ids')
            responses = []
            if ids:
                records_to_delete = Record.objects.filter(id__in=ids, user=request.user.id)                        
                records_to_delete._raw_delete(records_to_delete.db)
                responses.append({'detail': 'Records deleted successfully'})
            else:
                return Response(
                    {"detail": "No records to delete"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except ValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
        return Response(responses, status=status.HTTP_204_NO_CONTENT)

    def destroy(self, request, *args, **kwargs):
        try:
            date = self.get_object().date
            self.validate_date(date)
        except ValidationError as e:
            return Response({'detail': e}, status=status.HTTP_400_BAD_REQUEST)
        
        return super(RecordViewSet, self).destroy(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        records_to_create = []
        responses = []
        for record_data in request.data:
            serializer = self.get_serializer(data=record_data)
            if serializer.is_valid():
                try:
                    date_value = parse_date(record_data.get('date'))
                    working_hours_value = record_data.get('working_hours')
                    user_value = record_data.get('user_id')
                    self.validate_working_hours(working_hours_value)
                    self.validate_date(date_value)
                    user = User.objects.get(id=user_value)
                    self.check_object_permissions(request, user)                      
                    # If all validations pass, add the record to the list for bulk creation
                    records_to_create.append(Record(**serializer.validated_data))
                except ValidationError as e:
                    responses.append({'detail': str(e), 'record_data': record_data})
            else:
                # If serializer is not valid, include the errors in the response
                responses.append({'detail': serializer.errors, 'record_data': record_data})

        if records_to_create:
            # Use bulk_create to insert many records
            Record.objects.bulk_create(records_to_create)
            responses.append({'detail': 'Records created successfully'})

        return Response(responses, status=status.HTTP_201_CREATED)

    def put(self, request, *args, **kwargs):
        records_to_update = []
        responses = []

        for record_data in request.data:
            serializer = self.get_serializer(data=record_data)
            if serializer.is_valid():
                try:
                    date_value = parse_date(record_data.get('date'))
                    working_hours_value = record_data.get('working_hours')
                    self.validate_working_hours(working_hours_value)
                    self.validate_date(date_value)

                    #get the record to update
                    id_value = record_data.get('id')
                    project_value = record_data.get('project_id')
                    work_package_value = record_data.get('work_package_id')
                    data = Record.objects.get(id=id_value)

                    self.check_object_permissions(request, data)

                    #update value
                    data.date = date_value
                    data.work_package_id = work_package_value
                    data.working_hours = working_hours_value
                    data.project = Project.objects.get(id=project_value)

                    # If all validations pass, add the record to the list for bulk update
                    records_to_update.append(data)

                except ValidationError as e:
                    return Response({'detail': e}, status=status.HTTP_400_BAD_REQUEST)
            else:
                # If serializer is not valid, include the errors in the response
                responses.append({'detail': serializer.errors, 'record_data': record_data})

        if records_to_update:
            Record.objects.bulk_update(
                records_to_update,
                ["date", "working_hours", "project", "work_package_id"],
            )
            responses.append({'detail': 'Records updated successfully'})

        return Response(responses, status=status.HTTP_200_OK)
    
    def get_queryset(self):                                                                                             
        user = self.request.user
                
        if user.position == 'Manager':
            return self.queryset

        return self.queryset.filter(Q(user=user) | (Q(user__team=user.team) & ~Q(user__team=None)))