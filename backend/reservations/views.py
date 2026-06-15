from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Reservation
from .serializers import (
    HistoryReservationSerializer,
    PendingReservationSerializer,
    ReservationCreateSerializer,
    ReservationSerializer,
)
from .utils import has_conflict


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.select_related("room", "room__building", "user")

    def get_serializer_class(self):
        if self.action == "create":
            return ReservationCreateSerializer
        if self.action == "pending":
            return PendingReservationSerializer
        if self.action == "history":
            return HistoryReservationSerializer
        return ReservationSerializer

    # ---------- Criacao ----------

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        priority = "alta" if "docente" in (request.user.profiles or []) else "normal"
        reservation = serializer.save(
            user=request.user, status="pendente", priority=priority
        )
        return Response(
            ReservationSerializer(reservation).data, status=status.HTTP_201_CREATED
        )

    # ---------- Listas ----------

    @action(detail=False, methods=["get"])
    def my_reservations(self, request):
        qs = self.get_queryset().filter(user=request.user)
        serializer = ReservationSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def pending(self, request):
        if not request.user.is_secretariado:
            return Response({"detail": "Sem permissao."}, status=403)
        qs = self.get_queryset().filter(status="pendente")

        search = request.query_params.get("search")
        if search:
            qs = qs.filter(purpose__icontains=search)

        serializer = PendingReservationSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def history(self, request):
        if not request.user.is_secretariado:
            return Response({"detail": "Sem permissao."}, status=403)
        qs = self.get_queryset()

        params = request.query_params
        building_id = params.get("buildingId")
        if building_id and building_id.isdigit():
            qs = qs.filter(room__building_id=int(building_id))

        room_id = params.get("roomId")
        if room_id and room_id.isdigit():
            qs = qs.filter(room_id=int(room_id))

        search = params.get("search")
        if search:
            qs = qs.filter(purpose__icontains=search)

        start_date = params.get("startDate")
        if start_date:
            qs = qs.filter(date__gte=start_date)

        end_date = params.get("endDate")
        if end_date:
            qs = qs.filter(date__lte=end_date)

        order = params.get("sortOrder", "desc")
        qs = qs.order_by("date" if order == "asc" else "-date")

        serializer = HistoryReservationSerializer(qs, many=True)
        return Response(serializer.data)

    # ---------- Acoes sobre uma reserva ----------

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        reservation = self.get_object()
        if reservation.user_id != request.user.id and not request.user.is_secretariado:
            return Response({"detail": "Sem permissao."}, status=403)
        reservation.status = "cancelada"
        reservation.save(update_fields=["status", "updated_at"])
        return Response(ReservationSerializer(reservation).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        if not request.user.is_secretariado:
            return Response({"detail": "Sem permissao."}, status=403)
        reservation = self.get_object()
        if has_conflict(
            reservation.room,
            reservation.date,
            reservation.start_time,
            reservation.end_time,
            exclude_id=reservation.id,
        ):
            return Response(
                {"detail": "Conflito com outra reserva confirmada."}, status=409
            )
        reservation.status = "confirmada"
        reservation.save(update_fields=["status", "updated_at"])
        return Response(ReservationSerializer(reservation).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        if not request.user.is_secretariado:
            return Response({"detail": "Sem permissao."}, status=403)
        reservation = self.get_object()
        reservation.status = "rejeitada"
        reservation.rejection_reason = request.data.get("reason", "")
        reservation.save(update_fields=["status", "rejection_reason", "updated_at"])
        return Response(ReservationSerializer(reservation).data)
