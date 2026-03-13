from rest_framework import viewsets
from rest_framework.permissions import DjangoModelPermissions, IsAuthenticated

from ..models import Team
from ..serializers import TeamSerializer


class TeamViewSet(viewsets.ModelViewSet):
     queryset = Team.objects.all()
     serializer_class = TeamSerializer
     permission_classes = [IsAuthenticated, DjangoModelPermissions]

