from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('price',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'name', 'phone', 'total', 'status', 'date')
    list_filter = ('status', 'date')
    search_fields = ('order_number', 'name', 'phone', 'email')
    inlines = [OrderItemInline]
    readonly_fields = ('order_number', 'date', 'subtotal', 'total')
