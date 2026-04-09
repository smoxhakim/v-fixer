from rest_framework import serializers
from .models import Order, OrderItem
from catalog.models import Product
import uuid

class OrderItemSerializer(serializers.ModelSerializer):
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product'
    )

    class Meta:
        model = OrderItem
        fields = ['product_id', 'quantity', 'price']
        extra_kwargs = {
            'price': {'read_only': True}
        }

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'name', 'phone', 'email', 'address', 'city',
            'postal_code', 'notes', 'subtotal', 'total', 'date', 'status', 'items'
        ]
        read_only_fields = ['id', 'order_number', 'date', 'status']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Calculate subtotal and total implicitly if trusting frontend, 
        # or calculate explicitly based on items. Setting from validated_data for simplicity from frontend.
        order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        order = Order.objects.create(order_number=order_number, **validated_data)
        
        for item_data in items_data:
            product = item_data['product']
            price = product.price if not product.discount_price else product.discount_price
            OrderItem.objects.create(order=order, product=product, quantity=item_data['quantity'], price=price)
            
        return order
