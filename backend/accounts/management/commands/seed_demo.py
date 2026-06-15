from datetime import date, time, timedelta

from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import User
from facilities.models import Building, Equipment, Room
from reservations.models import Reservation

EQUIPMENT = [
    ("projetor", "Projetor", "\U0001F4FD"),
    ("quadro", "Quadro Branco", "\U0001F4CB"),
    ("wifi", "WiFi", "\U0001F4F6"),
    ("computadores", "Computadores", "\U0001F4BB"),
    ("arcondicionado", "Ar Condicionado", "❄"),
    ("videoconferencia", "Videoconferencia", "\U0001F3A5"),
    ("som", "Sistema de Som", "\U0001F50A"),
    ("quadrointerativo", "Quadro Interativo", "\U0001F5A5"),
]

BUILDINGS = [
    ("Colegio do Espirito Santo", "Largo dos Colegiais, 2"),
    ("Colegio Mateus de Aranda", "Rua da Universidade, 1"),
    ("Polo da Mitra", "Estrada da Mitra"),
    ("Complexo Desportivo", "Avenida da Universidade"),
]

# (nome, edificio, capacidade, tipo, [codigos de equipamento])
ROOMS = [
    ("Sala 101", "Colegio do Espirito Santo", 30, "aula", ["projetor", "quadro", "wifi"]),
    ("Sala 102", "Colegio do Espirito Santo", 25, "aula", ["quadro", "wifi"]),
    ("Laboratorio 202", "Colegio do Espirito Santo", 20, "laboratorio", ["computadores", "projetor", "wifi"]),
    ("Sala de Reunioes 305", "Colegio Mateus de Aranda", 15, "reuniao", ["videoconferencia", "wifi", "quadro"]),
    ("Sala 201", "Colegio Mateus de Aranda", 25, "aula", ["quadro", "wifi"]),
    ("Sala 001", "Polo da Mitra", 40, "aula", ["projetor", "quadro", "wifi"]),
    ("Auditorio", "Complexo Desportivo", 150, "auditorio", ["projetor", "som", "arcondicionado"]),
]

# (email, nome, perfis, departamento, building_access)
USERS = [
    ("admin@uevora.pt", "Admin Geral", ["administrador"], "Administracao", ["all"]),
    ("secretariado@uevora.pt", "Maria Santos", ["secretariado"], "Secretariado Academico", ["all"]),
    ("professor@uevora.pt", "Joao Silva", ["docente"], "Engenharia Informatica", []),
    ("aluno@alunos.uevora.pt", "Ana Costa", ["aluno"], "Engenharia Informatica", []),
    # Conta com varios perfis — demonstra a pagina de selecao de perfil no login.
    ("coordenacao@uevora.pt", "Teresa Rodrigues", ["secretariado", "docente"], "Coordenacao", ["all"]),
]


class Command(BaseCommand):
    help = "Cria dados de demonstracao (edificios, salas, equipamentos, utilizadores e reservas)."

    @transaction.atomic
    def handle(self, *args, **options):
        equipment = {}
        for code, name, icon in EQUIPMENT:
            obj, _ = Equipment.objects.get_or_create(
                code=code, defaults={"name": name, "icon": icon}
            )
            equipment[code] = obj

        buildings = {}
        for name, address in BUILDINGS:
            obj, _ = Building.objects.get_or_create(
                name=name, defaults={"address": address}
            )
            buildings[name] = obj

        rooms = {}
        for name, building_name, capacity, room_type, equip_codes in ROOMS:
            obj, _ = Room.objects.get_or_create(
                name=name,
                building=buildings[building_name],
                defaults={"capacity": capacity, "type": room_type},
            )
            obj.equipment.set([equipment[c] for c in equip_codes])
            rooms[name] = obj

        users = {}
        for email, name, profiles, dept, access in USERS:
            obj, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    "name": name,
                    "profiles": profiles,
                    "department": dept,
                    "building_access": access,
                },
            )
            users[email] = obj

        professor = users["professor@uevora.pt"]
        aluno = users["aluno@alunos.uevora.pt"]

        today = date.today()

        demo_reservations = [
            # Confirmadas (historico / agenda)
            (rooms["Sala 101"], professor, today - timedelta(days=20),
             time(9, 0), time(11, 0), "Aula de Programacao Web", "confirmada"),
            (rooms["Laboratorio 202"], professor, today - timedelta(days=10),
             time(14, 0), time(17, 0), "Experiencias de Quimica", "confirmada"),
            (rooms["Sala 101"], professor, today + timedelta(days=5),
             time(9, 0), time(11, 0), "Aula de Programacao Web", "confirmada"),
            # Pendentes (pagina do secretariado)
            (rooms["Sala 201"], aluno, today + timedelta(days=7),
             time(15, 0), time(17, 0), "Estudo em grupo", "pendente"),
            (rooms["Auditorio"], professor, today + timedelta(days=9),
             time(9, 0), time(13, 0), "Palestra sobre Inovacao", "pendente"),
            # Reserva do aluno (minhas reservas)
            (rooms["Sala de Reunioes 305"], aluno, today + timedelta(days=3),
             time(10, 0), time(12, 0), "Reuniao de projeto final", "confirmada"),
        ]

        created = 0
        for room, user, res_date, start, end, purpose, st in demo_reservations:
            _, was_created = Reservation.objects.get_or_create(
                room=room,
                user=user,
                date=res_date,
                start_time=start,
                end_time=end,
                defaults={
                    "purpose": purpose,
                    "status": st,
                    "priority": "alta" if "docente" in user.profiles else "normal",
                },
            )
            created += int(was_created)

        # Importa tambem as salas reais do CLAV (SALAS CLAV.xlsx).
        call_command("seed_clav")

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed concluido: {len(buildings)} edificios, {len(rooms)} salas, "
                f"{len(equipment)} equipamentos, {len(users)} utilizadores, "
                f"{created} reservas novas (+ salas do CLAV acima)."
            )
        )
        self.stdout.write(
            "Emails de demonstracao: admin@uevora.pt, secretariado@uevora.pt, "
            "professor@uevora.pt, aluno@alunos.uevora.pt"
        )
