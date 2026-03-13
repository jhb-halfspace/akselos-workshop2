from import_export import resources, fields
from .models import Project, WorkPackage
from import_export.widgets import ForeignKeyWidget


class ForeignKeyWidgetWithCreate(ForeignKeyWidget):
    def clean(self, value, row=None, *args, **kwargs):
        if not value:
            return None
        return Project.objects.get_or_create(**{self.field: value})[0]


class WorkPackageResource(resources.ModelResource):
    project = fields.Field(
        column_name='Project Name',
        attribute='project',
        widget=ForeignKeyWidgetWithCreate(Project, 'project_name')
    )
    work_package_name = fields.Field(
        column_name='Work Packages',
        attribute='work_package_name'
    )
    
    description = fields.Field(
        column_name='Description',
        attribute='description'
    )

    class Meta:
        model = WorkPackage
        fields = ('id', 'project', 'work_package_name', 'description')
        import_id_fields = ('project', 'work_package_name', 'description')
        skip_unchanged = True
        report_skipped = True
        use_transactions = True