import django_filters.rest_framework
from rest_framework import viewsets
from rest_framework.permissions import DjangoModelPermissions, IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from ..models import Project, Status, User
from ..serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
     queryset = Project.objects.filter(status=Status.ACTIVE)
     serializer_class = ProjectSerializer
     filter_backends = [django_filters.rest_framework.DjangoFilterBackend]
     filterset_fields = ('project_name',)
     permission_classes = [IsAuthenticated, DjangoModelPermissions]
     
     def get_queryset(self):
          user = self.request.user
          projects = self.queryset
          if user.can_access_all_projects:
               return projects

          query = Q(authorized_users=user)
          if user.team:
               query |= Q(authorized_teams=user.team)
          
          # Allow projects that have no restrictions
          unrestricted_q = Q(authorized_users__isnull=True, authorized_teams__isnull=True)

          return projects.filter(query | unrestricted_q).distinct()