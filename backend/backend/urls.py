"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from catalog.auth_views import (
    AdminChangePasswordView,
    AdminProfileView,
    AdminTokenObtainPairView,
)
from catalog.views import (
    CategoryViewSet,
    HomeBestSellingView,
    HomeHeroView,
    ProductViewSet,
)
from orders.views import OrderViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/home-hero/', HomeHeroView.as_view(), name='home-hero'),
    path(
        'api/home-best-selling/',
        HomeBestSellingView.as_view(),
        name='home-best-selling',
    ),
    path('api/', include(router.urls)),
    path('api/auth/token/', AdminTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path(
        'api/auth/change-password/',
        AdminChangePasswordView.as_view(),
        name='auth-change-password',
    ),
    path('api/auth/me/', AdminProfileView.as_view(), name='auth-me'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
