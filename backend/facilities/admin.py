from django.contrib import admin

from .models import Building, Equipment, Room


@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    list_display = ("name", "address")
    search_fields = ("name",)


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "icon")
    search_fields = ("name", "code")


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("name", "building", "capacity", "type")
    list_filter = ("building", "type")
    search_fields = ("name",)
    filter_horizontal = ("equipment",)
