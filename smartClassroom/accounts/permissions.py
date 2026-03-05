from rest_framework.permissions import BasePermission


class IsStudent(BasePermission):
    message = "Only students can access this resource."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'student'
        )


class IsFaculty(BasePermission):
    message = "Only faculty can access this resource."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'faculty'
        )


class IsAdminUser(BasePermission):
    message = "Only administrators can access this resource."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


class IsFacultyOrAdmin(BasePermission):
    message = "Only faculty or administrators can access this resource."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ('faculty', 'admin')
        )
