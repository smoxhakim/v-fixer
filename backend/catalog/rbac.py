"""Role → capability mapping for storefront admin RBAC."""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from django.contrib.auth.models import AbstractUser

# Capability strings (stable API contract for frontend + DRF checks)
CAP_USERS_READ = "users.read"
CAP_USERS_WRITE = "users.write"
CAP_ROLES_ASSIGN = "roles.assign"
CAP_CATALOG_READ = "catalog.read"
CAP_CATALOG_WRITE = "catalog.write"
CAP_ORDERS_READ = "orders.read"
CAP_ORDERS_WRITE = "orders.write"

_ALL_CAPS = frozenset(
    {
        CAP_USERS_READ,
        CAP_USERS_WRITE,
        CAP_ROLES_ASSIGN,
        CAP_CATALOG_READ,
        CAP_CATALOG_WRITE,
        CAP_ORDERS_READ,
        CAP_ORDERS_WRITE,
    }
)

# Staff with no profile yet (legacy / tests): treat as admin for catalog/orders only.
_FALLBACK_STAFF_CAPS = frozenset(
    {
        CAP_CATALOG_READ,
        CAP_CATALOG_WRITE,
        CAP_ORDERS_READ,
        CAP_ORDERS_WRITE,
    }
)


def _role_caps() -> dict[str, frozenset[str]]:
    from catalog.models import StaffProfile

    admin_like = frozenset(
        {
            CAP_CATALOG_READ,
            CAP_CATALOG_WRITE,
            CAP_ORDERS_READ,
            CAP_ORDERS_WRITE,
        }
    )
    return {
        StaffProfile.ROLE_SUPER_ADMIN: _ALL_CAPS,
        StaffProfile.ROLE_ADMIN: admin_like,
        StaffProfile.ROLE_MANAGER: admin_like,
    }


def get_staff_role(user: AbstractUser) -> str | None:
    """Return app RBAC role slug, or None if not staff."""
    from catalog.models import StaffProfile

    if not getattr(user, "is_staff", False):
        return None
    try:
        return user.staff_profile.role
    except StaffProfile.DoesNotExist:
        return StaffProfile.ROLE_ADMIN


def capabilities_for(user: AbstractUser) -> frozenset[str]:
    """Frozen set of capability strings for this user."""
    if not getattr(user, "is_authenticated", False):
        return frozenset()
    if not getattr(user, "is_staff", False):
        return frozenset()
    role = get_staff_role(user)
    if role is None:
        return _FALLBACK_STAFF_CAPS
    return _role_caps().get(role, frozenset())


def has_capability(user: AbstractUser, codename: str) -> bool:
    return codename in capabilities_for(user)
