from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("catalog", "0005_homebestsellingitem"),
    ]

    operations = [
        migrations.AddField(
            model_name="category",
            name="image_url",
            field=models.CharField(
                blank=True,
                default="",
                help_text="Hero image URL or /media/… path for storefront category tiles",
                max_length=2000,
            ),
        ),
    ]
