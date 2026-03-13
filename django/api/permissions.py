from rest_framework import permissions

class IsOwnerOrTeamViewer(permissions.BasePermission):
    """
    SAFE methods: allow owner or same-team members to view the record.
    UNSAFE methods: only the owner can modify/delete.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        if isinstance(obj, request.user.__class__):
            record_owner = obj
        else:
            record_owner = getattr(obj, 'user', None)

        if request.method in permissions.SAFE_METHODS:
            if user.position == 'Manager':
                return True
            return (
                record_owner == user or
                (record_owner and record_owner.team and record_owner.team == user.team)
            )

        # Only the owner can modify/delete
        return record_owner == request.user