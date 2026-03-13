from rest_framework import serializers

from .models import Asset, Department, Project, Record, Team, User, WorkPackage


class AssetSerializer(serializers.ModelSerializer):
    project_id = serializers.PrimaryKeyRelatedField(
        source="project", queryset=Project.objects.all()
    )
    class Meta:
        model = Asset
        fields = ["customer_name", "market_segment", "project_id", "asset_type"]


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'


class RecordSerializer(serializers.ModelSerializer):    
    project_id = serializers.PrimaryKeyRelatedField(
        source="project", queryset=Project.objects.all()
    )
    user_id = serializers.PrimaryKeyRelatedField(
        source="user", queryset=User.objects.all()
    )
    class Meta:
        model = Record
        fields = ["id", "user_id", "project_id", "work_package_id", "date", "working_hours"]


class UserSerializer(serializers.ModelSerializer):
    department_id = serializers.PrimaryKeyRelatedField(
        source="department", queryset=Department.objects.all()
    )
    team_id = serializers.PrimaryKeyRelatedField(
        source="team", queryset=Team.objects.all()
    )

    class Meta:
        model = User
        # To be sure to not break the API, we list the fields.
        fields = [
            "id",
            "user_name",
            "position",
            "note",
            "department_id",
            "team_id",
            "is_active",
            "receive_email",
        ]


class ProjectSerializer(serializers.ModelSerializer):
    department_id = serializers.PrimaryKeyRelatedField(
        source="department", queryset=Department.objects.all()
    )
    
    class Meta:
        model = Project
        fields = ["id", "project_name", "ref_code", "department_id", "activity"]


class WorkPackageSerializer(serializers.ModelSerializer):
    project_id = serializers.PrimaryKeyRelatedField(
        source="project", queryset=Project.objects.all()
    )
    class Meta:
        model = WorkPackage
        fields = ["id", "project_id", "work_package_name", "description"]