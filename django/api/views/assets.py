import django_filters.rest_framework
from rest_framework import viewsets

from ..models import Asset
from ..serializers import AssetSerializer


class AssetViewSet(viewsets.ModelViewSet):
     queryset = Asset.objects.all()
     serializer_class = AssetSerializer
     filter_backends = [django_filters.rest_framework.DjangoFilterBackend]
     filterset_fields = ('customer_name',)
