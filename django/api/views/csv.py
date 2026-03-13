from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from utils.helpers import find_column_value, parse_date

from ..models import Project, Record, User, WorkPackage


class CSVViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["post"])
    def upload_csv(self, request, *args, **kwargs):
        try:
            user_name = request.POST.get("userName")
            user_id = User.objects.get(user_name=user_name).id

            if user_id:
                # Use request.FILES to access the uploaded file
                date_file = request.POST.get("date")
                csv_file = request.FILES.get("file")

                if date_file and csv_file:
                    # Process CSV data and extract relevant information
                    csv_data = csv_file.read().decode("utf-8").strip()

                    rows = csv_data.split("\r\n")
                    titles = rows[0].split(",")
                    records = []

                    for row in rows[1:]:
                        columns = row.split(",")
                        if not row.strip():
                            continue

                        project_name = find_column_value(titles, columns, "Project")
                        work_package_name = find_column_value(titles, columns, "Work Package")
                        working_hours = float(
                            find_column_value(titles, columns, "Working Hours", default="0.0")
                        )

                        date_column_value = find_column_value(
                            titles, columns, "Date", default=date_file
                        )
                        date = parse_date(date_column_value)  # Adjust the format accordingly

                        try:
                            project_id = Project.objects.get(project_name=project_name).id
                        except Project.DoesNotExist:
                            # Handle the case where no matching project is found
                            continue

                        try:
                            work_package_id = WorkPackage.objects.get(
                                work_package_name=work_package_name, project_id=project_id
                            ).id
                        except WorkPackage.DoesNotExist:
                            # Handle the case where no matching work package is found
                            work_package_id = 0

                        record_data = {
                            "project_id": project_id,
                            "work_package_id": work_package_id,
                            "working_hours": working_hours,
                            "user_id": user_id,
                            "date": date,
                        }

                        records.append(record_data)

                    # Create Records instances and save them
                    Record.objects.bulk_create([Record(**record_data) for record_data in records])

                    return Response(
                        {"status": "success", "message": "Records created successfully"}
                    )

            else:
                return Response({"status": "error", "message": "Invalid credentials"})

        except Exception as e:
            return Response({"status": "error", "message": str(e)})
