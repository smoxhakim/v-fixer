from rest_framework import serializers
from .models import Category, HomeBestSellingItem, HomeHeroItem, Product

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "icon", "image_url", "parent"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        url = data.get("image_url")
        if request and isinstance(url, str) and url.startswith("/") and not url.startswith("//"):
            data["image_url"] = request.build_absolute_uri(url)
        return data

class ProductSerializer(serializers.ModelSerializer):
    category_slug = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category_slug', 'category', 'price',
            'cost_price',
            'discount_price', 'rating', 'images', 'short_description', 
            'description', 'specs', 'stock'
        ]
        extra_kwargs = {
            'category': {'write_only': True, 'required': False, 'allow_null': True}
        }

    def get_category_slug(self, obj):
        return obj.category.slug if obj.category_id else None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        images = data.get("images")
        if request and isinstance(images, list) and images:
            fixed = []
            for url in images:
                if isinstance(url, str) and url.startswith("/") and not url.startswith("//"):
                    fixed.append(request.build_absolute_uri(url))
                else:
                    fixed.append(url)
            data["images"] = fixed
        return data


def _hero_slide_row(obj: HomeHeroItem):
    return {
        "tag": obj.tag,
        "title": obj.title,
        "description": obj.description,
        "image_url": obj.image_url,
        "link_href": obj.link_href,
        "gradient_class": obj.gradient_class,
    }


class HomeHeroMainSlideInputSerializer(serializers.Serializer):
    tag = serializers.CharField(allow_blank=True, max_length=120, required=False, default="")
    title = serializers.CharField(max_length=200)
    description = serializers.CharField(allow_blank=True, max_length=500, required=False, default="")
    image_url = serializers.CharField(max_length=2000)
    link_href = serializers.CharField(max_length=500)
    gradient_class = serializers.CharField(allow_blank=True, max_length=200, required=False, default="")


class HomeHeroSidePromoInputSerializer(serializers.Serializer):
    tag = serializers.CharField(allow_blank=True, max_length=120, required=False, default="")
    title = serializers.CharField(max_length=200)
    description = serializers.CharField(allow_blank=True, max_length=500, required=False, default="")
    image_url = serializers.CharField(max_length=2000, allow_blank=True, required=False, default="")
    link_href = serializers.CharField(max_length=500)
    gradient_class = serializers.CharField(allow_blank=True, max_length=200, required=False, default="")


class HomeHeroUpdateSerializer(serializers.Serializer):
    main_slides = serializers.ListField(
        child=HomeHeroMainSlideInputSerializer(),
        min_length=1,
        max_length=5,
    )
    side_promos = serializers.ListField(
        child=HomeHeroSidePromoInputSerializer(),
        min_length=1,
        max_length=2,
    )


def build_home_hero_response():
    main_qs = HomeHeroItem.objects.filter(kind=HomeHeroItem.MAIN).order_by("position")
    side_qs = HomeHeroItem.objects.filter(kind=HomeHeroItem.SIDE).order_by("position")
    return {
        "main_slides": [_hero_slide_row(o) for o in main_qs],
        "side_promos": [_hero_slide_row(o) for o in side_qs],
    }


HOME_BEST_SELLING_CATEGORY_PRODUCT_CAP = 48


def build_home_best_selling_response(request=None):
    rows = []
    qs = (
        HomeBestSellingItem.objects.select_related("product", "category")
        .order_by("position")
    )
    ctx = {"request": request} if request else {}
    for row in qs:
        if row.kind == HomeBestSellingItem.KIND_PRODUCT and row.product_id:
            rows.append(
                {
                    "kind": HomeBestSellingItem.KIND_PRODUCT,
                    "product": ProductSerializer(row.product, context=ctx).data,
                }
            )
        elif row.kind == HomeBestSellingItem.KIND_CATEGORY and row.category_id:
            cat = row.category
            product_qs = Product.objects.filter(category_id=cat.id).order_by(
                "name", "id"
            )
            total = product_qs.count()
            capped = list(product_qs[:HOME_BEST_SELLING_CATEGORY_PRODUCT_CAP])
            products_data = [
                ProductSerializer(p, context=ctx).data for p in capped
            ]
            rows.append(
                {
                    "kind": HomeBestSellingItem.KIND_CATEGORY,
                    "category": CategorySerializer(cat).data,
                    "products": products_data,
                    "product_count": total,
                }
            )
    return {"items": rows}


class HomeBestSellingItemInputSerializer(serializers.Serializer):
    kind = serializers.ChoiceField(
        choices=[
            HomeBestSellingItem.KIND_PRODUCT,
            HomeBestSellingItem.KIND_CATEGORY,
        ]
    )
    product_slug = serializers.CharField(
        required=False, allow_blank=True, default=""
    )
    category_slug = serializers.CharField(
        required=False, allow_blank=True, default=""
    )

    def validate(self, attrs):
        kind = attrs["kind"]
        ps = (attrs.get("product_slug") or "").strip()
        cs = (attrs.get("category_slug") or "").strip()
        if kind == HomeBestSellingItem.KIND_PRODUCT:
            if not ps:
                raise serializers.ValidationError(
                    {"product_slug": "Required when kind is product."}
                )
            if not Product.objects.filter(slug=ps).exists():
                raise serializers.ValidationError(
                    {"product_slug": f"Unknown product slug: {ps}"}
                )
        else:
            if not cs:
                raise serializers.ValidationError(
                    {"category_slug": "Required when kind is category."}
                )
            if not Category.objects.filter(slug=cs).exists():
                raise serializers.ValidationError(
                    {"category_slug": f"Unknown category slug: {cs}"}
                )
        attrs["product_slug"] = ps
        attrs["category_slug"] = cs
        return attrs


class HomeBestSellingUpdateSerializer(serializers.Serializer):
    items = serializers.ListField(
        child=HomeBestSellingItemInputSerializer(),
        max_length=30,
        allow_empty=True,
    )
