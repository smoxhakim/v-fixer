from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'parent']

class ProductSerializer(serializers.ModelSerializer):
    category_slug = serializers.CharField(source='category.slug', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category_slug', 'category', 'price', 
            'discount_price', 'rating', 'images', 'short_description', 
            'description', 'specs', 'stock'
        ]
        extra_kwargs = {
            'category': {'write_only': True}
        }
