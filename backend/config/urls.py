from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from accounts.views import UserViewSet, LoginView, GoogleLoginView
from facilities.views import BuildingViewSet, EquipmentViewSet, RoomViewSet
from reservations.views import ReservationViewSet
from imports.views import ImportView, ImportTemplateView

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")
router.register(r"buildings", BuildingViewSet, basename="building")
router.register(r"equipment", EquipmentViewSet, basename="equipment")
router.register(r"rooms", RoomViewSet, basename="room")
router.register(r"reservations", ReservationViewSet, basename="reservation")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/users/login/", LoginView.as_view(), name="login"),
    path("api/users/google-login/", GoogleLoginView.as_view(), name="google-login"),
    path("api/imports/", ImportView.as_view(), name="imports"),
    path("api/imports/template/", ImportTemplateView.as_view(), name="import-template"),
    path("api/", include(router.urls)),
]
