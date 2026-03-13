import django_filters.rest_framework
from rest_framework import viewsets
from rest_framework.permissions import DjangoModelPermissions, IsAuthenticated

from ..models import WorkPackage, Status
from ..serializers import WorkPackageSerializer


class WorkPackageViewSet(viewsets.ModelViewSet):
     queryset = WorkPackage.objects.filter(status=Status.ACTIVE)
     serializer_class = WorkPackageSerializer
     filter_backends = [django_filters.rest_framework.DjangoFilterBackend]
     filterset_fields = ('work_package_name',)
     permission_classes = [IsAuthenticated, DjangoModelPermissions]
