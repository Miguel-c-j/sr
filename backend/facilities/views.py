from django.db.models import Count
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from reservations.utils import build_schedule

from .models import Building, Equipment, Room
from .serializers import BuildingSerializer, EquipmentSerializer, RoomSerializer


class BuildingViewSet(viewsets.ModelViewSet):
    serializer_class = BuildingSerializer

    def get_queryset(self):
        return Building.objects.annotate(room_count=Count("rooms")).order_by("name")


class EquipmentViewSet(viewsets.ModelViewSet):
    serializer_class = EquipmentSerializer

    def get_queryset(self):
        return Equipment.objects.annotate(usage_count=Count("rooms")).order_by("name")


class RoomViewSet(viewsets.ModelViewSet):
    serializer_class = RoomSerializer

    def get_queryset(self):
        qs = (
            Room.objects.select_related("building")
            .prefetch_related("equipment")
            .order_by("name")
        )
        params = self.request.query_params

        building = params.get("building")
        if building:
            # Aceita id do edificio ou o nome (o frontend filtra por nome).
            if building.isdigit():
                qs = qs.filter(building_id=int(building))
            else:
                qs = qs.filter(building__name=building)

        min_capacity = params.get("minCapacity")
        if min_capacity and str(min_capacity).isdigit():
            qs = qs.filter(capacity__gte=int(min_capacity))

        room = params.get("room")
        if room:
            qs = qs.filter(name=room)

        room_types = params.get("roomTypes")
        if room_types:
            qs = qs.filter(type__in=[t for t in room_types.split(",") if t])

        equipment = params.get("equipment")
        if equipment:
            codes = [e for e in equipment.split(",") if e]
            if codes:
                qs = qs.filter(equipment__code__in=codes).distinct()

        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        date = self.request.query_params.get("date")
        if date:
            context["date"] = date
        return context

    @action(detail=True, methods=["get"])
    def availability(self, request, pk=None):
        room = self.get_object()
        date = request.query_params.get("date")
        if not date:
            return Response({"detail": "Parametro 'date' obrigatorio."}, status=400)
        return Response({"date": date, "schedule": build_schedule(room, date)})
