from django.db import migrations, models


def seed_home_hero(apps, schema_editor):
    HomeHeroItem = apps.get_model("catalog", "HomeHeroItem")
    if HomeHeroItem.objects.exists():
        return
    main = [
        {
            "tag": "GAMING GEAR",
            "title": "GAME CONTROLLER",
            "description": "Controller type: Wireless controller",
            "image_url": "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&h=500&fit=crop",
            "link_href": "/category/game-console",
            "gradient_class": "from-[#0a1628] to-[#1a3a5c]",
        },
        {
            "tag": "NEW ARRIVALS",
            "title": "MACBOOK PRO M3",
            "description": "The most powerful laptop ever made",
            "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=500&fit=crop",
            "link_href": "/category/computer",
            "gradient_class": "from-[#1a1a2e] to-[#16213e]",
        },
        {
            "tag": "HOT DEALS",
            "title": "AIRPODS PRO 2",
            "description": "Adaptive Audio. Personalized Spatial Audio.",
            "image_url": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&h=500&fit=crop",
            "link_href": "/category/audio",
            "gradient_class": "from-[#0f2027] to-[#203a43]",
        },
    ]
    side = [
        {
            "tag": "NEW ARRIVALS",
            "title": "BAMBOOBUDS",
            "description": "",
            "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=500&h=300&fit=crop",
            "link_href": "/category/audio",
            "gradient_class": "from-[#e83e8c] to-[#6f42c1]",
        },
        {
            "tag": "NEW ARRIVALS",
            "title": "HOMEPOD PRO",
            "description": "",
            "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=300&fit=crop",
            "link_href": "/category/audio",
            "gradient_class": "from-[#1a1a2e] to-[#4a148c]",
        },
    ]
    for i, row in enumerate(main):
        HomeHeroItem.objects.create(kind="main", position=i, **row)
    for i, row in enumerate(side):
        HomeHeroItem.objects.create(kind="side", position=i, **row)


class Migration(migrations.Migration):

    dependencies = [
        ("catalog", "0003_alter_product_category_nullable"),
    ]

    operations = [
        migrations.CreateModel(
            name="HomeHeroItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("kind", models.CharField(choices=[("main", "Main carousel"), ("side", "Side promo")], db_index=True, max_length=10)),
                ("position", models.PositiveSmallIntegerField(default=0)),
                ("tag", models.CharField(blank=True, max_length=120)),
                ("title", models.CharField(max_length=200)),
                ("description", models.CharField(blank=True, max_length=500)),
                ("image_url", models.CharField(blank=True, max_length=2000)),
                ("link_href", models.CharField(max_length=500)),
                (
                    "gradient_class",
                    models.CharField(
                        blank=True,
                        help_text="Tailwind gradient classes, e.g. from-[#0a1628] to-[#1a3a5c]",
                        max_length=200,
                    ),
                ),
            ],
            options={
                "ordering": ["kind", "position"],
            },
        ),
        migrations.AddConstraint(
            model_name="homeheroitem",
            constraint=models.UniqueConstraint(
                fields=("kind", "position"),
                name="catalog_homehero_unique_kind_position",
            ),
        ),
        migrations.RunPython(seed_home_hero, migrations.RunPython.noop),
    ]
