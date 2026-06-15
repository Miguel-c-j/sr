from rest_framework import serializers

from facilities.models import Room

from .models import Reservation
from .utils import duration_label, has_conflict


# ---------- Nested helpers ----------

class SalaSerializer(serializers.ModelSerializer):
    nome = serializers.CharField(source="name")
    edificio = serializers.CharField(source="building.name")
    capacidade = serializers.IntegerField(source="capacity")
    tipo = serializers.CharField(source="type")

    class Meta:
        model = Room
        fields = ["id", "nome", "edificio", "capacidade", "tipo"]


class SolicitanteField(serializers.Serializer):
    def to_representation(self, user):
        return {
            "nome": user.name or user.email,
            "email": user.email,
            "tipo": user.tipo,
        }


# ---------- Pagina "Minhas Reservas" ----------

class ReservationSerializer(serializers.ModelSerializer):
    sala = SalaSerializer(source="room", read_only=True)
    data = serializers.DateField(source="date", read_only=True)
    horaInicio = serializers.TimeField(source="start_time", format="%H:%M", read_only=True)
    horaFim = serializers.TimeField(source="end_time", format="%H:%M", read_only=True)
    estado = serializers.CharField(source="status", read_only=True)
    proposito = serializers.CharField(source="purpose", read_only=True)
    criadoEm = serializers.DateTimeField(source="created_at", read_only=True)
    ultimaAtualizacao = serializers.DateTimeField(source="updated_at", read_only=True)
    motivoRejeicao = serializers.CharField(source="rejection_reason", read_only=True)

    class Meta:
        model = Reservation
        fields = [
            "id", "sala", "data", "horaInicio", "horaFim", "estado",
            "proposito", "criadoEm", "ultimaAtualizacao", "motivoRejeicao",
        ]


# ---------- Criacao de reserva ----------

class ReservationCreateSerializer(serializers.ModelSerializer):
    roomId = serializers.PrimaryKeyRelatedField(
        source="room", queryset=Room.objects.all()
    )
    data = serializers.DateField(source="date")
    horaInicio = serializers.TimeField(source="start_time")
    horaFim = serializers.TimeField(source="end_time")
    proposito = serializers.CharField(source="purpose", allow_blank=True, required=False)

    class Meta:
        model = Reservation
        fields = ["id", "roomId", "data", "horaInicio", "horaFim", "proposito"]

    def validate(self, attrs):
        if attrs["start_time"] >= attrs["end_time"]:
            raise serializers.ValidationError(
                "A hora de fim tem de ser posterior a hora de inicio."
            )
        if has_conflict(attrs["room"], attrs["date"], attrs["start_time"], attrs["end_time"]):
            raise serializers.ValidationError(
                "Ja existe uma reserva confirmada para esta sala neste horario."
            )
        return attrs


# ---------- Pagina "Pedidos Pendentes" (secretariado) ----------

class PendingReservationSerializer(serializers.ModelSerializer):
    solicitante = SolicitanteField(source="user", read_only=True)
    sala = serializers.SerializerMethodField()
    data = serializers.DateField(source="date")
    horaInicio = serializers.TimeField(source="start_time", format="%H:%M")
    horaFim = serializers.TimeField(source="end_time", format="%H:%M")
    duracao = serializers.SerializerMethodField()
    dataSubmissao = serializers.DateTimeField(source="created_at")
    status = serializers.SerializerMethodField()
    prioridade = serializers.CharField(source="priority")

    class Meta:
        model = Reservation
        fields = [
            "id", "solicitante", "sala", "data", "horaInicio", "horaFim",
            "duracao", "proposito", "dataSubmissao", "status", "prioridade",
        ]

    proposito = serializers.CharField(source="purpose")

    def get_sala(self, obj):
        return {
            "nome": obj.room.name,
            "edificio": obj.room.building.name,
            "capacidade": obj.room.capacity,
        }

    def get_duracao(self, obj):
        return duration_label(obj.start_time, obj.end_time)

    def get_status(self, obj):
        return "pending"


# ---------- Pagina "Historico" (secretariado) ----------

class HistoryReservationSerializer(serializers.ModelSerializer):
    solicitante = SolicitanteField(source="user", read_only=True)
    sala = serializers.SerializerMethodField()
    data = serializers.DateField(source="date")
    horaInicio = serializers.TimeField(source="start_time", format="%H:%M")
    horaFim = serializers.TimeField(source="end_time", format="%H:%M")
    duracao = serializers.SerializerMethodField()
    proposito = serializers.CharField(source="purpose")
    estado = serializers.CharField(source="status")
    criadoEm = serializers.DateTimeField(source="created_at")

    class Meta:
        model = Reservation
        fields = [
            "id", "sala", "solicitante", "data", "horaInicio", "horaFim",
            "duracao", "proposito", "estado", "criadoEm",
        ]

    def get_sala(self, obj):
        return {
            "id": obj.room.id,
            "name": obj.room.name,
            "buildingId": obj.room.building_id,
            "buildingName": obj.room.building.name,
        }

    def get_duracao(self, obj):
        return duration_label(obj.start_time, obj.end_time)
