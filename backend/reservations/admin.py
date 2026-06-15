from django.contrib import admin

from .models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("room", "user", "date", "start_time", "end_time", "status")
    list_filter = ("status", "date", "room__building")
    search_fields = ("purpose", "user__email", "room__name")
