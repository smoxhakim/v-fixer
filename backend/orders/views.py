from rest_framework import viewsets, permissions
from rest_framework.response import Response

from catalog.permissions import IsStaffUser, requires_capability
from catalog.rbac import CAP_ORDERS_READ, CAP_ORDERS_WRITE
from .models import Order
from .serializers import OrderSerializer
from rest_framework.response import Response

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-date')
    serializer_class = OrderSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        if self.action in ('list', 'retrieve'):
            return [
                permissions.IsAuthenticated(),
                IsStaffUser(),
                requires_capability(CAP_ORDERS_READ)(),
            ]
        return [
            permissions.IsAuthenticated(),
            IsStaffUser(),
            requires_capability(CAP_ORDERS_WRITE)(),
        ]

    def perform_create(self, serializer):
        serializer.save()
