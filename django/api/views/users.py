import django_filters.rest_framework
from rest_framework import viewsets
from rest_framework.permissions import DjangoModelPermissions, IsAuthenticated
from django.db.models import Q

from ..models import User
from ..serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
     queryset = User.objects.filter(is_active=True)
     serializer_class = UserSerializer
     filter_backends = [django_filters.rest_framework.DjangoFilterBackend]
     filterset_fields = ('user_name',)
     permission_classes = [IsAuthenticated, DjangoModelPermissions]
     
     def get_queryset(self):
          user = self.request.user
          user_list = self.queryset
          
          if user.position == 'Manager':
               return user_list
          
          # Regular users can only see their own or their team
          query = Q(user_name=user.user_name)
          
          if user.team:
               query |= Q(team=user.team)

          return user_list.filter(query)
          
