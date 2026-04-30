"""DRF permissions built on catalog.rbac capabilities."""

from __future__ import annotations

from rest_framework.permissions import BasePermission

from catalog.rbac import has_capability


class IsStaffUser(BasePermission):
    """Active staff (JWT admin users)."""

    def has_permission(self, request, view):
        u = request.user
        return bool(
            u
            and u.is_authenticated
            and getattr(u, "is_active", False)
            and getattr(u, "is_staff", False)
        )


def requires_capability(*codes: str):
    """Return a BasePermission subclass requiring all listed capabilities."""

    codes_f = frozenset(codes)

    class _RequiresCapability(BasePermission):
        def has_permission(self, request, view):
            if not request.user or not request.user.is_authenticated:
                return False
            if not getattr(request.user, "is_staff", False):
                return False
            for c in codes_f:
                if not has_capability(request.user, c):
                    return False
            return True

    _RequiresCapability.__name__ = f"Requires_{'_'.join(c.replace('.', '_') for c in sorted(codes_f))}"
    return _RequiresCapability
