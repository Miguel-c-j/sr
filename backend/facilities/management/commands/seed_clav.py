"""Popula a BD com as salas do Colegio Luis Antonio Verney (CLAV).

Dados importados de "SALAS CLAV.xlsx" (folha SALAS CLAV):
- numero da sala, capacidade e a coluna "CABO de REDE".
As aspas (") do Excel foram resolvidas para o valor da linha anterior, e o tipo
de sala foi inferido (com computadores/microscopios -> laboratorio; ANF -> auditorio).

Idempotente: pode correr varias vezes sem duplicar.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from facilities.models import Building, Equipment, Room

BUILDING_NAME = "Colegio Luis Antonio Verney"
BUILDING_ADDRESS = "Rua Romao Ramalho, 59, Evora"

# Equipamentos referidos pela folha (codigo, nome, icone).
EQUIPMENT = [
    ("caboderede", "Cabo de Rede", "\U0001F50C"),
    ("computadores", "Computadores", "\U0001F4BB"),
    ("microscopios", "Microscopios", "\U0001F52C"),
]

# (nome, capacidade, tipo, [codigos de equipamento])
ROOMS = [
    ('Sala 122', 22, 'laboratorio', ['microscopios', 'caboderede']),
    ('Sala 124', 40, 'aula', ['caboderede']),
    ('Sala 125', 32, 'aula', ['caboderede']),
    ('Sala 126', 40, 'aula', ['caboderede']),
    ('Sala 127', 42, 'aula', ['caboderede']),
    ('Sala 128', 35, 'aula', ['caboderede']),
    ('Sala 129', 48, 'aula', ['caboderede']),
    ('Sala 130', 82, 'aula', ['caboderede']),
    ('Sala 131', 32, 'aula', ['caboderede']),
    ('Sala 133', 35, 'aula', ['caboderede']),
    ('Sala 134', 42, 'aula', ['caboderede']),
    ('Sala 135', 24, 'laboratorio', ['computadores', 'caboderede']),
    ('Sala 136', 30, 'aula', ['caboderede']),
    ('Sala 137', 32, 'laboratorio', ['computadores', 'caboderede']),
    ('Sala 138', 18, 'aula', ['caboderede']),
    ('Sala 139', 29, 'laboratorio', ['computadores', 'caboderede']),
    ('Sala 140', 16, 'aula', ['caboderede']),
    ('Sala 150', 60, 'aula', ['caboderede']),
    ('Sala 154', 24, 'aula', []),
    ('Sala 155', 20, 'aula', ['caboderede']),
    ('Sala 156', 36, 'aula', ['caboderede']),
    ('Sala 157', 48, 'aula', []),
    ('Sala 168', 22, 'aula', ['caboderede']),
    ('Sala 169', 22, 'aula', ['caboderede']),
    ('Sala 170', 24, 'aula', ['caboderede']),
    ('Sala 171', 24, 'aula', ['caboderede']),
    ('Sala 173', 26, 'aula', ['caboderede']),
    ('Sala 174', 30, 'aula', ['caboderede']),
    ('Sala 93', 20, 'laboratorio', ['computadores', 'caboderede']),
    ('Sala 66', 63, 'aula', ['caboderede']),
    ('Anfiteatro 1', 70, 'auditorio', []),
    ('Anfiteatro 2', 200, 'auditorio', []),
    ('Anfiteatro 3', 100, 'auditorio', []),
    ('Anfiteatro 4', 100, 'auditorio', []),
]


class Command(BaseCommand):
    help = "Importa as salas do CLAV (SALAS CLAV.xlsx) para a base de dados."

    @transaction.atomic
    def handle(self, *args, **options):
        equipment = {}
        for code, name, icon in EQUIPMENT:
            obj, _ = Equipment.objects.get_or_create(
                code=code, defaults={"name": name, "icon": icon}
            )
            equipment[code] = obj

        building, _ = Building.objects.get_or_create(
            name=BUILDING_NAME, defaults={"address": BUILDING_ADDRESS}
        )

        created = 0
        for name, capacity, room_type, equip_codes in ROOMS:
            room, was_created = Room.objects.get_or_create(
                name=name,
                building=building,
                defaults={"capacity": capacity, "type": room_type},
            )
            if not was_created:
                room.capacity = capacity
                room.type = room_type
                room.save(update_fields=["capacity", "type"])
            room.equipment.set([equipment[c] for c in equip_codes])
            created += int(was_created)

        self.stdout.write(
            self.style.SUCCESS(
                f"CLAV importado: edificio '{building.name}', "
                f"{len(ROOMS)} salas ({created} novas), {len(equipment)} equipamentos."
            )
        )
