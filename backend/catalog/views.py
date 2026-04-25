from django.db import transaction
from rest_framework import viewsets, permissions, status
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, HomeBestSellingItem, HomeHeroItem, Product
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    HomeBestSellingUpdateSerializer,
    HomeHeroUpdateSerializer,
    build_home_best_selling_response,
    build_home_hero_response,
)
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from .importers import (
    import_categories_csv,
    import_products_xlsx,
    import_products_zip,
    preview_products_xlsx,
)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        child_count = Category.objects.filter(parent_id=instance.id).count()
        if child_count:
            return Response(
                {
                    "detail": (
                        f"Cannot delete: {child_count} subcategor"
                        f"{'y' if child_count == 1 else 'ies'} still use this as a parent. "
                        "Reassign or delete those categories first."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        product_count = Product.objects.filter(category_id=instance.id).count()
        if product_count:
            return Response(
                {
                    "detail": (
                        f"Cannot delete: {product_count} product(s) still belong to "
                        "this category. Reassign or delete those products first."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)

    @action(
        detail=False,
        methods=["post"],
        url_path="import",
        permission_classes=[permissions.IsAdminUser],
        parser_classes=[MultiPartParser, FormParser],
    )
    def import_categories(self, request):
        upload = request.FILES.get("file")
        if upload is None:
            return Response(
                {"created": 0, "updated": 0, "errors": [{"row": 1, "message": "Missing file field."}]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        result = import_categories_csv(upload)
        code = status.HTTP_200_OK if not result.get("errors") else status.HTTP_207_MULTI_STATUS
        return Response(result, status=code)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        category_slug = self.request.query_params.get('categorySlug', None)
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        return queryset

    @action(
        detail=False,
        methods=["post"],
        url_path="import",
        permission_classes=[permissions.IsAdminUser],
        parser_classes=[MultiPartParser, FormParser],
    )
    def import_products(self, request):
        upload = request.FILES.get("file") or request.FILES.get("archive")
        if upload is None:
            return Response(
                {"created": 0, "errors": [{"row": 1, "message": "Missing file field."}]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        is_zip = str(getattr(upload, "name", "")).lower().endswith(".zip")
        result = import_products_zip(upload) if is_zip else import_products_xlsx(upload)
        code = status.HTTP_200_OK if not result.get("errors") else status.HTTP_207_MULTI_STATUS
        return Response(result, status=code)

    @action(
        detail=False,
        methods=["post"],
        url_path="import-preview",
        permission_classes=[permissions.IsAdminUser],
        parser_classes=[MultiPartParser, FormParser],
    )
    def import_products_preview(self, request):
        upload = request.FILES.get("file")
        if upload is None:
            return Response(
                {"created": 0, "rows": [], "errors": [{"row": 1, "message": "Missing file field."}]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        result = preview_products_xlsx(upload)
        code = status.HTTP_200_OK if not result.get("errors") else status.HTTP_207_MULTI_STATUS
        return Response(result, status=code)


class HomeHeroView(APIView):
    """Public GET; admin PUT replaces all hero rows."""

    def get_permissions(self):
        if self.request.method in ("GET", "HEAD", "OPTIONS"):
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get(self, request):
        return Response(build_home_hero_response())

    def put(self, request):
        ser = HomeHeroUpdateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        with transaction.atomic():
            HomeHeroItem.objects.all().delete()
            for pos, row in enumerate(ser.validated_data["main_slides"]):
                HomeHeroItem.objects.create(kind=HomeHeroItem.MAIN, position=pos, **row)
            for pos, row in enumerate(ser.validated_data["side_promos"]):
                HomeHeroItem.objects.create(kind=HomeHeroItem.SIDE, position=pos, **row)
        return Response(build_home_hero_response())


class HomeBestSellingView(APIView):
    """Public GET; admin PUT replaces all best-selling slots."""

    parser_classes = [JSONParser]

    def get_permissions(self):
        if self.request.method in ("GET", "HEAD", "OPTIONS"):
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get(self, request):
        return Response(build_home_best_selling_response(request))

    def put(self, request):
        ser = HomeBestSellingUpdateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        items_data = ser.validated_data["items"]
        with transaction.atomic():
            HomeBestSellingItem.objects.all().delete()
            for pos, row in enumerate(items_data):
                if row["kind"] == HomeBestSellingItem.KIND_PRODUCT:
                    product = Product.objects.get(slug=row["product_slug"])
                    HomeBestSellingItem.objects.create(
                        position=pos,
                        kind=HomeBestSellingItem.KIND_PRODUCT,
                        product=product,
                    )
                else:
                    category = Category.objects.get(slug=row["category_slug"])
                    HomeBestSellingItem.objects.create(
                        position=pos,
                        kind=HomeBestSellingItem.KIND_CATEGORY,
                        category=category,
                    )
        return Response(build_home_best_selling_response(request))
