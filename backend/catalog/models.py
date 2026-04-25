from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    icon = models.CharField(max_length=100, blank=True, null=True, help_text="Lucide icon name")
    image_url = models.CharField(
        max_length=2000,
        blank=True,
        default="",
        help_text="Hero image URL or /media/… path for storefront category tiles",
    )
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories')

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return f"{self.parent.name} > {self.name}" if self.parent else self.name

class Product(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='products',
        null=True,
        blank=True,
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    images = models.JSONField(default=list, blank=True)
    short_description = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    specs = models.JSONField(default=list, blank=True)
    stock = models.IntegerField(default=0)

    def __str__(self):
        return self.name


class HomeHeroItem(models.Model):
    """Homepage hero: main carousel (left) or side promos (right column)."""

    MAIN = "main"
    SIDE = "side"
    KIND_CHOICES = [(MAIN, "Main carousel"), (SIDE, "Side promo")]

    kind = models.CharField(max_length=10, choices=KIND_CHOICES, db_index=True)
    position = models.PositiveSmallIntegerField(default=0)
    tag = models.CharField(max_length=120, blank=True)
    title = models.CharField(max_length=200)
    description = models.CharField(max_length=500, blank=True)
    image_url = models.CharField(max_length=2000, blank=True)
    link_href = models.CharField(max_length=500)
    gradient_class = models.CharField(
        max_length=200,
        blank=True,
        help_text="Tailwind gradient classes, e.g. from-[#0a1628] to-[#1a3a5c]",
    )

    class Meta:
        ordering = ["kind", "position"]
        constraints = [
            models.UniqueConstraint(
                fields=["kind", "position"],
                name="catalog_homehero_unique_kind_position",
            ),
        ]

    def __str__(self):
        return f"{self.kind}:{self.position} {self.title}"


class HomeBestSellingItem(models.Model):
    """Homepage “Best selling” grid: ordered mix of products and categories."""

    KIND_PRODUCT = "product"
    KIND_CATEGORY = "category"
    KIND_CHOICES = [(KIND_PRODUCT, "Product"), (KIND_CATEGORY, "Category")]

    position = models.PositiveIntegerField(default=0)
    kind = models.CharField(max_length=20, choices=KIND_CHOICES)
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="best_selling_slots",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="best_selling_slots",
    )

    class Meta:
        ordering = ["position"]
        constraints = [
            models.UniqueConstraint(
                fields=["position"],
                name="catalog_homebest_unique_position",
            ),
        ]

    def __str__(self):
        if self.kind == self.KIND_PRODUCT and self.product_id:
            return f"p:{self.position} {self.product}"
        if self.kind == self.KIND_CATEGORY and self.category_id:
            return f"c:{self.position} {self.category}"
        return f"{self.kind}:{self.position}"
