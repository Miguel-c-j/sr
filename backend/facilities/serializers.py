from rest_framework import serializers

from .models import Building, Equipment, Room


class BuildingSerializer(serializers.ModelSerializer):
    # Anotado no queryset do viewset.
    roomCount = serializers.IntegerField(source="room_count", read_only=True)

    class Meta:
        model = Building
        fields = ["id", "name", "address", "roomCount"]


class EquipmentSerializer(serializers.ModelSerializer):
    usageCount = serializers.IntegerField(source="usage_count", read_only=True)

    class Meta:
        model = Equipment
        fields = ["id", "code", "name", "icon", "usageCount"]
        read_only_fields = ["code"]


class RoomSerializer(serializers.ModelSerializer):
    buildingId = serializers.PrimaryKeyRelatedField(
        source="building", queryset=Building.objects.all()
    )
    building = serializers.CharField(source="building.name", read_only=True)
    equipment = serializers.SlugRelatedField(
        slug_field="code",
        many=True,
        queryset=Equipment.objects.all(),
        required=False,
    )
    schedule = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            "id",
            "name",
            "capacity",
            "buildingId",
            "building",
            "type",
            "equipment",
            "schedule",
        ]

    def get_schedule(self, obj):
        # So calculado quando o pedido tras uma data (ex: pesquisa de salas).
        date = self.context.get("date")
        if not date:
            return None
        from reservations.utils import build_schedule

        return build_schedule(obj, date)
