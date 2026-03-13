# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or
# field names.
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    Group,
    PermissionsMixin,
)
from django.core.exceptions import ValidationError
from django.db import models


class Asset(models.Model):
    customer_name = models.CharField(primary_key=True, max_length=255)
    market_segment = models.CharField(max_length=255)
    project = models.ForeignKey("Project", on_delete=models.CASCADE, null=True)
    asset_type = models.CharField(max_length=255)

    class Meta:
        db_table = "assets"
        unique_together = (("customer_name", "market_segment", "project"),)


class Department(models.Model):
    id = models.BigAutoField(primary_key=True)
    department_name = models.CharField(unique=True, max_length=255)

    class Meta:
        db_table = "departments"

    def __str__(self):
        return self.department_name


class Team(models.Model):
    name = models.CharField(unique=True, max_length=255)

    class Meta:
        db_table = "teams"

    def __str__(self):
        return self.name
    

class Status(models.TextChoices):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ON_HOLD = "on-hold"


class Record(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey("User", on_delete=models.DO_NOTHING, blank=True, null=True)
    project = models.ForeignKey("Project", on_delete=models.CASCADE, blank=True, null=True)
    work_package_id = models.BigIntegerField(blank=True)
    date = models.DateField()
    working_hours = models.FloatField()

    def clean(self):
        if self.working_hours > 24:
            raise ValidationError(
                {"working_hours": ("Working hour of record can not larger than 24.")}
            )
        if self.working_hours <= 0:
            raise ValidationError({"working_hours": ("Invalid working hours")})

    class Meta:
        db_table = "records"
        ordering = ["-id"]
        indexes = [
            models.Index(fields=['user_id', 'project_id', '-id']),
            models.Index(fields=['user_id', '-id']),
        ]


class AksUserManager(BaseUserManager):
    def create_user(self, user_name, password=None):
        user = self.model(user_name=user_name)

        user.set_password(password)
        user.save(using=self._db)
        user.groups.add(Group.objects.get(name='time_user'))

        return user

    def create_superuser(self, user_name, password=None):
        user = self.create_user(
            user_name,
            password=password,
        )
        user.is_admin = True
        user.is_staff = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser,  PermissionsMixin):
    USERNAME_FIELD = "user_name"

    id = models.BigAutoField(primary_key=True)
    user_name = models.CharField(unique=True, max_length=255)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, blank=True, null=True)
    team = models.ForeignKey(Team, on_delete=models.DO_NOTHING, blank=True, null=True)
    # The default value is generate thanks to make_password(None) from django.contrib.auth.hashers
    # it starts with an UNUSABLE_PASSWORD_PREFIX, which will never be a valid encoded hash.
    password = models.CharField(max_length=128, default="!21KQLVdt7IL77YWGD1aAUb4UFb8lvYT8Iu2hV5kb")

    position = models.CharField(max_length=255)
    note = models.CharField(max_length=255, blank=True, null=True)
    receive_email = models.BooleanField(default=True)
    
    # Projects now have set permissions, but we have some special users who can access all projects 
    can_access_all_projects = models.BooleanField(default=False)

    # Fields required for authentication
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    objects = AksUserManager()

    @property
    def is_superuser(self):
        return self.is_admin

    class Meta:
        db_table = "users"
        ordering = ["user_name"]

    def __str__(self):
        return self.user_name


class Project(models.Model):
    id = models.BigAutoField(primary_key=True)
    project_name = models.CharField(unique=True, max_length=255)
    ref_code = models.CharField(max_length=255, blank=True, null=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, blank=True, null=True)
    activity = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=Status.choices, default=Status.ACTIVE)
    authorized_users = models.ManyToManyField(
        User,
        related_name='accessible_projects_user',
        blank=True,
        help_text="Users who have explicit access to this project."
    )
    authorized_teams = models.ManyToManyField(
        Team,
        related_name='accessible_projects_team',
        blank=True,
        help_text="Teams whose members have access to this project."
    )
    
    def list_authorized_users(self):
        return ", ".join([str(p) for p in self.authorized_users.all()])
    
    def list_authorized_teams(self):
        return ", ".join([str(p) for p in self.authorized_teams.all()])

    class Meta:
        db_table = "projects"
        ordering = ["project_name"]

    def __str__(self):
        return self.project_name


class WorkPackage(models.Model):
    id = models.BigAutoField(primary_key=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, blank=True, null=True)
    work_package_name = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=Status.choices, default=Status.ACTIVE)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "work_packages"
        ordering = ["work_package_name"]

    def __str__(self):
        return self.work_package_name