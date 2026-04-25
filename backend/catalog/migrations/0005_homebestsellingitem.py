import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("catalog", "0004_homeheroitem"),
    ]

    operations = [
        migrations.CreateModel(
            name="HomeBestSellingItem",
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
                ("position", models.PositiveIntegerField(default=0)),
                (
                    "kind",
                    models.CharField(
                        choices=[("product", "Product"), ("category", "Category")],
                        max_length=20,
                    ),
                ),
                (
                    "category",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="best_selling_slots",
                        to="catalog.category",
                    ),
                ),
                (
                    "product",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="best_selling_slots",
                        to="catalog.product",
                    ),
                ),
            ],
            options={
                "ordering": ["position"],
            },
        ),
        migrations.AddConstraint(
            model_name="homebestsellingitem",
            constraint=models.UniqueConstraint(
                fields=("position",),
                name="catalog_homebest_unique_position",
            ),
        ),
    ]
