from django.contrib import admin
from .models import Category, HomeBestSellingItem, HomeHeroItem, Product

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent")
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)

@admin.register(HomeHeroItem)
class HomeHeroItemAdmin(admin.ModelAdmin):
    list_display = ("kind", "position", "title", "link_href")
    list_filter = ("kind",)
    ordering = ("kind", "position")


@admin.register(HomeBestSellingItem)
class HomeBestSellingItemAdmin(admin.ModelAdmin):
    list_display = ("position", "kind", "product", "category")
    ordering = ("position",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'stock')
    list_filter = ('category',)
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'description')
