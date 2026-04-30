"""Promote exactly one staff user to super_admin (shell / deploy only; not via REST API)."""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from catalog.models import StaffProfile


class Command(BaseCommand):
    help = (
        "Set a staff user's StaffProfile.role to super_admin. "
        "Fails if another user already holds super_admin (demote that user first in Django admin or DB)."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--username",
            required=True,
            help="Existing staff user username (is_staff=True).",
        )

    def handle(self, *args, **options):
        username = options["username"]
        User = get_user_model()
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist as exc:
            raise CommandError(f"User {username!r} does not exist.") from exc
        if not user.is_staff:
            raise CommandError("User must have is_staff=True.")
        existing_other = StaffProfile.objects.filter(role=StaffProfile.ROLE_SUPER_ADMIN).exclude(
            user_id=user.pk
        )
        if existing_other.exists():
            raise CommandError(
                "Another user already has role super_admin. Remove or demote that profile first, "
                "then re-run this command."
            )
        profile, _ = StaffProfile.objects.get_or_create(
            user=user,
            defaults={"role": StaffProfile.ROLE_ADMIN},
        )
        profile.role = StaffProfile.ROLE_SUPER_ADMIN
        profile.save(update_fields=["role"])
        self.stdout.write(self.style.SUCCESS(f"User {username!r} is now the super_admin."))
