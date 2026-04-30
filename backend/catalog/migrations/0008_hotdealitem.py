from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("catalog", "0007_staffprofile"),
    ]

    operations = [
        migrations.CreateModel(
            name="HotDealItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("position", models.PositiveIntegerField(default=0)),
                (
                    "product",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="hot_deal_slots",
                        to="catalog.product",
                    ),
                ),
            ],
            options={
                "ordering": ["position"],
            },
        ),
        migrations.AddConstraint(
            model_name="hotdealitem",
            constraint=models.UniqueConstraint(
                fields=("position",),
                name="catalog_hotdeal_unique_position",
            ),
        ),
    ]
