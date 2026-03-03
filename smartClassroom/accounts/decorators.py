from functools import wraps

from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden


def role_required(allowed_roles):
    """Decorator that checks if user has one of the allowed roles."""
    def decorator(view_func):
        @wraps(view_func)
        @login_required
        def wrapper(request, *args, **kwargs):
            if request.user.role in allowed_roles:
                return view_func(request, *args, **kwargs)
            return HttpResponseForbidden("You do not have permission to access this page.")
        return wrapper
    return decorator


def student_required(view_func):
    return role_required(['student'])(view_func)


def faculty_required(view_func):
    return role_required(['faculty'])(view_func)


def admin_required(view_func):
    return role_required(['admin'])(view_func)
