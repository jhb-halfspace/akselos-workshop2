from rest_framework import routers
from django.urls import include, path

from . import views
from .views.csv import CSVViewSet

router = routers.SimpleRouter(trailing_slash=False)

router.register(r'departments', views.DepartementViewSet)
router.register(r'teams', views.TeamViewSet)
router.register(r'users', views.UserViewSet)
router.register(r'assets', views.AssetViewSet)
router.register(r'records', views.RecordViewSet)
router.register(r'work_packages', views.WorkPackageViewSet)
router.register(r'projects', views.ProjectViewSet)
router.register(r'auth', views.AuthViewSet, basename= 'auth')
router.register(r'csv', CSVViewSet, basename= 'csv')

urlpatterns = router.urls
