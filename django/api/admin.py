from django import forms
from django.contrib import admin
from django.contrib.auth import admin as auth_admin
from django.core.exceptions import ValidationError

from .models import Asset, Department, Project, Record, Team, User, WorkPackage, Status
from .resources import WorkPackageResource
from import_export.admin import ImportExportModelAdmin


class UserCreationForm(forms.ModelForm):
    """A form for creating new users. Includes all the required
    fields, plus a repeated password."""

    class Meta:
        model = User
        fields = [
            "user_name",
            "team",
            "department",
            "position",
            "note",
            "receive_email",
        ]

    def save(self, commit=True):
        # Save the provided password in hashed format
        user = super().save(commit=False)
        if commit:
            user.save()
        return user


@admin.register(User)
class UserAdmin(auth_admin.UserAdmin):
    add_form = UserCreationForm
    list_display = (
        "id",
        "user_name",
        "department",
        "team",
        "position",
        "is_active",
        "receive_email",
        "is_superuser",
        "is_staff",
        "can_access_all_projects",
    )
    list_filter = ("department",)
    fieldsets = (
        (None, {"fields": ("user_name", "password")}),
        (
            ("Personal info"),
            {"fields": ("team", "department", "position", "note", "receive_email", "can_access_all_projects")},
        ),
        (
            ("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_admin",
                    "groups",
                ),
            },
        ),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "user_name",
                    "team",
                    "department",
                    "position",
                    "note",
                    "receive_email",
                    "can_access_all_projects",
                ),
            },
        ),
    )
    filter_horizontal = ()

    search_fields = ("user_name",)
    ordering = ("user_name",)
    actions = ["change_receive_email", "change_active_status"]

    def change_receive_email(self, _, queryset):
        queryset.update(receive_email=not queryset.first().receive_email)

    change_receive_email.short_description = "Change Receive Email Status"

    def change_active_status(self, _, queryset):
        queryset.update(is_active=not queryset.first().is_active)

    change_active_status.short_description = "Change Active Status"


class ProjectCreationForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # just show active users in the list
        self.fields['authorized_users'].queryset = User.objects.filter(is_active=True)

    def clean(self):
        cleaned_data = super().clean()
        status = cleaned_data.get("status")
        authorized_teams = cleaned_data.get("authorized_teams")
        authorized_users = cleaned_data.get("authorized_users")

        if status != Status.ACTIVE:
            if authorized_teams.exists():
                raise ValidationError({"authorized_teams": ("Can not set authorized teams when status is not active")})
            if authorized_users.exists():
                raise ValidationError({"authorized_users": ("Can not set authorized users when status is not active")})        
        return cleaned_data
    
    def save(self, commit=True):
        scope = super().save(commit=False)
        if commit:
            scope.save()
        return scope


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    form = ProjectCreationForm
    list_display = ("id", "project_name", "department", "activity", "status", "list_authorized_users", "list_authorized_teams")
    list_filter = ("department", "activity")
    search_fields = ("project_name",)
    filter_horizontal = ('authorized_users', 'authorized_teams')


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ("customer_name", "market_segment", "project", "asset_type")
    list_filter = ("project", "asset_type")
    search_fields = ("customer_name", "market_segment")


@admin.register(Record)
class RecordAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "project", "date", "working_hours")
    list_filter = ("user", "project", "date")
    search_fields = ("user__user_name", "project__project_name")


@admin.register(WorkPackage)
class WorkPackageAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    list_display = ("id", "project", "work_package_name", "status", "description")
    list_filter = ("project",)
    search_fields = ("work_package_name", "project__project_name")
    resource_classes = [WorkPackageResource]


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("id", "department_name")
    search_fields = ("department_name",)


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)