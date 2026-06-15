from django.db import models
from django.utils.text import slugify

ROOM_TYPE_CHOICES = [
    ("aula", "Sala de Aula"),
    ("laboratorio", "Laboratorio"),
    ("reuniao", "Sala de Reunioes"),
    ("auditorio", "Auditorio"),
]


class Building(models.Model):
    name = models.CharField(max_length=150, unique=True)
    address = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Equipment(models.Model):
    # Codigo usado pelo frontend (ex: "projetor", "quadro").
    code = models.SlugField(max_length=50, unique=True, blank=True)
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=10, default="\U0001F527")

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = slugify(self.name).replace("-", "")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Room(models.Model):
    name = models.CharField(max_length=150)
    building = models.ForeignKey(
        Building, on_delete=models.PROTECT, related_name="rooms"
    )
    capacity = models.PositiveIntegerField(default=0)
    type = models.CharField(
        max_length=20, choices=ROOM_TYPE_CHOICES, default="aula"
    )
    equipment = models.ManyToManyField(Equipment, related_name="rooms", blank=True)

    class Meta:
        ordering = ["name"]
        unique_together = ("name", "building")

    def __str__(self):
        return f"{self.name} ({self.building.name})"
