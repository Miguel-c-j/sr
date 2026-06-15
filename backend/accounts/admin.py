from django.contrib import admin

from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "name", "department", "is_active")
    search_fields = ("email", "name")
    list_filter = ("is_active", "is_staff")
