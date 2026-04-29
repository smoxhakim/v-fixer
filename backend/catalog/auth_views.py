"""Admin JWT login (staff-only), profile, and password change."""

from django.contrib.auth import get_user_model
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()


class AdminTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Only active staff users may receive admin API tokens."""

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        if not user.is_active:
            raise serializers.ValidationError(
                {"detail": "This account is disabled."},
                code="authorization",
            )
        if not user.is_staff:
            raise serializers.ValidationError(
                {"detail": "Admin access only. Use a staff account (e.g. createsuperuser)."},
                code="authorization",
            )
        return data


class AdminTokenObtainPairView(TokenObtainPairView):
    serializer_class = AdminTokenObtainPairSerializer


class AdminProfileSerializer(serializers.ModelSerializer):
    """Staff profile for GET/PATCH (username is read-only)."""

    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email")
        read_only_fields = ("username",)


class AdminProfileView(APIView):
    """Return or update the authenticated staff user's profile."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response(
                {"detail": "Only staff accounts may use this endpoint."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return Response(AdminProfileSerializer(request.user).data)

    def patch(self, request):
        if not request.user.is_staff:
            return Response(
                {"detail": "Only staff accounts may use this endpoint."},
                status=status.HTTP_403_FORBIDDEN,
            )
        ser = AdminProfileSerializer(request.user, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)


class AdminChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)


class AdminChangePasswordView(APIView):
    """Authenticated staff may change their own password."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_staff:
            return Response(
                {"detail": "Only staff accounts may use this endpoint."},
                status=status.HTTP_403_FORBIDDEN,
            )
        ser = AdminChangePasswordSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(ser.validated_data["current_password"]):
            return Response(
                {"detail": "Current password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.set_password(ser.validated_data["new_password"])
        user.save(update_fields=["password"])
        return Response({"detail": "Password updated successfully."})
