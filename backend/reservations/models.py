from django.conf import settings
from django.db import models

from facilities.models import Room

STATUS_CHOICES = [
    ("pendente", "Pendente"),
    ("confirmada", "Confirmada"),
    ("cancelada", "Cancelada"),
    ("rejeitada", "Rejeitada"),
]

PRIORITY_CHOICES = [
    ("normal", "Normal"),
    ("alta", "Alta"),
]


class Reservation(models.Model):
    room = models.ForeignKey(
        Room, on_delete=models.PROTECT, related_name="reservations"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reservations",
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    purpose = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pendente"
    )
    priority = models.CharField(
        max_length=10, choices=PRIORITY_CHOICES, default="normal"
    )
    rejection_reason = models.TextField(blank=True, default="")
    # Reservas geradas por importacao de CSV (horarios/exames/calendario).
    is_imported = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "start_time"]

    def __str__(self):
        return f"{self.room.name} {self.date} {self.start_time}-{self.end_time}"
