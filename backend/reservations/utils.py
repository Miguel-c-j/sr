from datetime import datetime, timedelta

SLOT_START_HOUR = 8
SLOT_END_HOUR = 22
SLOT_MINUTES = 30


def generate_slots():
    """Slots de 30 minutos entre 08:00 e 22:00 (formato 'HH:MM')."""
    slots = []
    current = datetime(2000, 1, 1, SLOT_START_HOUR, 0)
    end = datetime(2000, 1, 1, SLOT_END_HOUR, 0)
    while current <= end:
        slots.append(current.strftime("%H:%M"))
        current += timedelta(minutes=SLOT_MINUTES)
    return slots


def build_schedule(room, date):
    """Mapa {slot: estado} para uma sala/data.

    'ocupado' para reservas confirmadas (inclui horarios importados),
    'reservado' para pedidos pendentes, 'livre' caso contrario.
    """
    from .models import Reservation

    slots = generate_slots()
    schedule = {slot: "livre" for slot in slots}

    reservations = Reservation.objects.filter(
        room=room, date=date, status__in=["confirmada", "pendente"]
    )
    for reservation in reservations:
        label = "ocupado" if reservation.status == "confirmada" else "reservado"
        for slot in slots:
            slot_time = datetime.strptime(slot, "%H:%M").time()
            if reservation.start_time <= slot_time < reservation.end_time:
                if schedule[slot] != "ocupado":
                    schedule[slot] = label
    return schedule


def duration_label(start_time, end_time):
    """Texto da duracao, ex: '2 horas' / '1 hora' / '1.5 horas'."""
    delta = datetime.combine(datetime.min, end_time) - datetime.combine(
        datetime.min, start_time
    )
    hours = delta.total_seconds() / 3600
    if hours == int(hours):
        hours = int(hours)
        return f"{hours} hora" if hours == 1 else f"{hours} horas"
    return f"{hours:.1f} horas"


def has_conflict(room, date, start_time, end_time, exclude_id=None,
                 statuses=("confirmada",)):
    """Verifica sobreposicao de horarios na mesma sala/data."""
    from .models import Reservation

    qs = Reservation.objects.filter(
        room=room,
        date=date,
        status__in=statuses,
        start_time__lt=end_time,
        end_time__gt=start_time,
    )
    if exclude_id:
        qs = qs.exclude(id=exclude_id)
    return qs.exists()
