"""Super-admin-only staff user management API."""

from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import generics, serializers, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from catalog.models import StaffProfile
from catalog.permissions import IsStaffUser, requires_capability
from catalog.rbac import CAP_USERS_READ, CAP_USERS_WRITE

User = get_user_model()

_STAFF_USER_FIELDS_READ = (
    "id",
    "username",
    "email",
    "first_name",
    "last_name",
    "is_active",
    "is_staff",
    "role",
)


class StaffUserPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 100


class StaffUserListSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = _STAFF_USER_FIELDS_READ

    def get_role(self, obj):
        try:
            return obj.staff_profile.role
        except StaffProfile.DoesNotExist:
            return StaffProfile.ROLE_ADMIN


class StaffUserCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True, default="")
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(
        choices=[
            c[0]
            for c in StaffProfile.ROLE_CHOICES
            if c[0] != StaffProfile.ROLE_SUPER_ADMIN
        ],
    )
    is_staff = serializers.BooleanField(default=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate(self, attrs):
        if not attrs.get("is_staff", True):
            raise serializers.ValidationError({"isStaff": "New admin users must be staff."})
        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            user = User.objects.create_user(
                username=validated_data["username"],
                email=validated_data.get("email") or "",
                password=validated_data["password"],
                is_staff=True,
                is_active=True,
            )
            StaffProfile.objects.create(user=user, role=validated_data["role"])
        return user


class StaffUserPatchSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=[c[0] for c in StaffProfile.ROLE_CHOICES], required=False)
    is_active = serializers.BooleanField(required=False)
    is_staff = serializers.BooleanField(required=False)
    new_password = serializers.CharField(write_only=True, min_length=8, required=False, allow_null=True)

    def validate_role(self, value):
        if value == StaffProfile.ROLE_SUPER_ADMIN:
            raise serializers.ValidationError("super_admin cannot be assigned via API.")
        return value

    def update(self, instance: User, validated_data):
        new_role = validated_data.get("role")
        new_active = validated_data.get("is_active")
        new_staff = validated_data.get("is_staff")
        new_password = validated_data.get("new_password")

        with transaction.atomic():
            profile, _ = StaffProfile.objects.select_for_update().get_or_create(
                user=instance,
                defaults={"role": StaffProfile.ROLE_ADMIN},
            )
            old_role = profile.role
            old_active = instance.is_active

            if new_role is not None and new_role != old_role:
                if new_role == StaffProfile.ROLE_SUPER_ADMIN:
                    raise serializers.ValidationError({"role": "super_admin cannot be assigned via API."})
                if old_role == StaffProfile.ROLE_SUPER_ADMIN:
                    others = (
                        User.objects.filter(
                            is_active=True,
                            staff_profile__role=StaffProfile.ROLE_SUPER_ADMIN,
                        )
                        .exclude(pk=instance.pk)
                        .count()
                    )
                    if others < 1:
                        raise serializers.ValidationError(
                            {"role": "Cannot remove the last active super_admin."},
                        )
                profile.role = new_role
                profile.save(update_fields=["role"])

            if new_active is not None and new_active is False:
                if profile.role == StaffProfile.ROLE_SUPER_ADMIN:
                    others = (
                        User.objects.filter(
                            is_active=True,
                            staff_profile__role=StaffProfile.ROLE_SUPER_ADMIN,
                        )
                        .exclude(pk=instance.pk)
                        .count()
                    )
                    if others < 1:
                        raise serializers.ValidationError(
                            {"is_active": "Cannot deactivate the last active super_admin."},
                        )

            if new_staff is not None and new_staff is False:
                if profile.role == StaffProfile.ROLE_SUPER_ADMIN:
                    raise serializers.ValidationError(
                        {"is_staff": "Cannot remove staff flag from a super_admin."},
                    )

            if new_active is not None:
                instance.is_active = new_active
            if new_staff is not None:
                instance.is_staff = new_staff
            if new_password:
                instance.set_password(new_password)
            instance.save()

        return instance


class StaffUserListCreateView(generics.ListCreateAPIView):
    pagination_class = StaffUserPagination

    def get_queryset(self):
        return User.objects.filter(is_staff=True).select_related("staff_profile").order_by("username")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return StaffUserCreateSerializer
        return StaffUserListSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            self.permission_classes = [
                IsAuthenticated,
                IsStaffUser,
                requires_capability(CAP_USERS_READ),
            ]
        else:
            self.permission_classes = [
                IsAuthenticated,
                IsStaffUser,
                requires_capability(CAP_USERS_WRITE),
            ]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        data = StaffUserListSerializer(user, context={"request": request}).data
        return Response(data, status=status.HTTP_201_CREATED)


class StaffUserDetailView(generics.GenericAPIView):
    queryset = User.objects.filter(is_staff=True).select_related("staff_profile")
    lookup_field = "pk"
    permission_classes = [
        IsAuthenticated,
        IsStaffUser,
        requires_capability(CAP_USERS_WRITE),
    ]

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        ser = StaffUserPatchSerializer(data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        patcher = StaffUserPatchSerializer()
        patcher.update(user, ser.validated_data)
        user.refresh_from_db()
        try:
            user.staff_profile.refresh_from_db()
        except StaffProfile.DoesNotExist:
            pass
        return Response(StaffUserListSerializer(user, context={"request": request}).data)
