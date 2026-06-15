import csv
import io
from datetime import datetime

from django.http import HttpResponse
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from facilities.models import Building, Room
from reservations.models import Reservation
from reservations.utils import has_conflict

IMPORT_TYPES = {"horarios_aulas", "horarios_exames", "calendario_letivo"}

REQUIRED_COLUMNS = [
    "edificio",
    "sala",
    "data",
    "hora_inicio",
    "hora_fim",
    "proposito",
]


def _parse_date(value):
    return datetime.strptime(value.strip(), "%Y-%m-%d").date()


def _parse_time(value):
    return datetime.strptime(value.strip(), "%H:%M").time()


class ImportView(APIView):
    """Importacao de CSV (horarios, exames, calendario).

    Cada linha valida gera uma reserva confirmada (is_imported=True).
    Devolve o resumo no formato esperado pelo frontend:
    {success, totalRecords, successCount, errorCount, errors:[{row, message}]}.
    """

    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        if not request.user.is_secretariado:
            return Response({"detail": "Sem permissao."}, status=403)

        import_type = request.data.get("type")
        upload = request.data.get("file")

        if import_type not in IMPORT_TYPES:
            return Response({"detail": "Tipo de importacao invalido."}, status=400)
        if upload is None:
            return Response({"detail": "Ficheiro CSV em falta."}, status=400)

        try:
            decoded = upload.read().decode("utf-8-sig")
        except UnicodeDecodeError:
            return Response({"detail": "O ficheiro tem de ser UTF-8."}, status=400)

        reader = csv.DictReader(io.StringIO(decoded))
        if reader.fieldnames is None:
            return Response({"detail": "CSV vazio."}, status=400)

        normalized = [(name or "").strip().lower() for name in reader.fieldnames]
        missing = [col for col in REQUIRED_COLUMNS if col not in normalized]
        if missing:
            return Response(
                {"detail": f"Colunas em falta: {', '.join(missing)}"}, status=400
            )

        # Cache de edificios e salas para evitar queries repetidas.
        buildings = {b.name.lower(): b for b in Building.objects.all()}
        rooms = {
            (r.building_id, r.name.lower()): r
            for r in Room.objects.select_related("building").all()
        }

        total = 0
        success = 0
        errors = []
        to_create = []

        for index, raw in enumerate(reader, start=2):  # linha 1 = cabecalho
            row = {k.strip().lower(): (v or "").strip() for k, v in raw.items()}
            total += 1

            building = buildings.get(row.get("edificio", "").lower())
            if not building:
                errors.append({"row": index, "message": "Edificio nao encontrado"})
                continue

            room = rooms.get((building.id, row.get("sala", "").lower()))
            if not room:
                errors.append({"row": index, "message": "Sala nao encontrada"})
                continue

            try:
                date = _parse_date(row["data"])
            except (ValueError, KeyError):
                errors.append({"row": index, "message": "Formato de data invalido"})
                continue

            try:
                start_time = _parse_time(row["hora_inicio"])
                end_time = _parse_time(row["hora_fim"])
            except (ValueError, KeyError):
                errors.append({"row": index, "message": "Formato de hora invalido"})
                continue

            if start_time >= end_time:
                errors.append({"row": index, "message": "Horario invalido"})
                continue

            owner = request.user
            docente_email = (row.get("docente_email") or "").strip().lower()
            if docente_email:
                owner = User.objects.filter(email=docente_email).first()
                if owner is None:
                    errors.append({"row": index, "message": "Professor nao encontrado"})
                    continue

            if has_conflict(room, date, start_time, end_time):
                errors.append({"row": index, "message": "Horario sobreposto"})
                continue

            to_create.append(
                Reservation(
                    room=room,
                    user=owner,
                    date=date,
                    start_time=start_time,
                    end_time=end_time,
                    purpose=row.get("proposito", ""),
                    status="confirmada",
                    is_imported=True,
                )
            )
            success += 1

        Reservation.objects.bulk_create(to_create)

        return Response(
            {
                "success": len(errors) == 0,
                "totalRecords": total,
                "successCount": success,
                "errorCount": len(errors),
                "errors": errors,
            }
        )


class ImportTemplateView(APIView):
    """Descarrega um template CSV com a estrutura esperada."""

    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        import_type = request.query_params.get("type", "horarios_aulas")
        filename = f"template_{import_type}.csv"

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        writer = csv.writer(response)
        writer.writerow(
            ["edificio", "sala", "data", "hora_inicio", "hora_fim", "proposito", "docente_email"]
        )
        writer.writerow(
            [
                "Colegio do Espirito Santo",
                "Sala 101",
                "2026-09-15",
                "09:00",
                "11:00",
                "Aula de Programacao Web",
                "professor@uevora.pt",
            ]
        )
        return response
