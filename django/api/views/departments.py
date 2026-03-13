from rest_framework import viewsets

from ..models import Department
from ..serializers import DepartmentSerializer


class DepartementViewSet(viewsets.ModelViewSet):
     queryset = Department.objects.all()
     serializer_class = DepartmentSerializer
