# Generated manually for StaffProfile + data migration

from django.conf import settings
from django.db import migrations, models


def create_profiles_for_staff(apps, schema_editor):
    User = apps.get_model("auth", "User")
    StaffProfile = apps.get_model("catalog", "StaffProfile")
    for u in User.objects.filter(is_staff=True):
        StaffProfile.objects.get_or_create(
            user_id=u.pk,
            defaults={"role": "admin"},
        )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("catalog", "0006_category_image_url"),
    ]

    operations = [
        migrations.CreateModel(
            name="StaffProfile",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "role",
                    models.CharField(
                        choices=[
                            ("super_admin", "Super admin"),
                            ("admin", "Admin"),
                            ("manager", "Manager"),
                        ],
                        db_index=True,
                        default="manager",
                        max_length=32,
                    ),
                ),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=models.deletion.CASCADE,
                        related_name="staff_profile",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Staff profile",
                "verbose_name_plural": "Staff profiles",
            },
        ),
        migrations.RunPython(create_profiles_for_staff, noop_reverse),
    ]
