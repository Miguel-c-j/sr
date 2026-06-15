from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.postgres.fields import ArrayField
from django.db import models

from .managers import UserManager
from .validators import validate_institutional_email

PROFILE_CHOICES = [
    ("convidado", "Convidado"),
    ("aluno", "Aluno"),
    ("docente", "Docente"),
    ("secretariado", "Secretariado"),
    ("administrador", "Administrador"),
]


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(
        unique=True, validators=[validate_institutional_email]
    )
    name = models.CharField(max_length=150, blank=True)
    department = models.CharField(max_length=150, blank=True)
    # Lista de perfis (um utilizador pode ter varios), ex: ["docente", "secretariado"]
    profiles = ArrayField(
        models.CharField(max_length=20, choices=PROFILE_CHOICES),
        default=list,
        blank=True,
    )
    # Edificios a que o secretariado tem acesso: lista de ids ou ["all"]
    building_access = models.JSONField(default=list, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    def __str__(self):
        return self.email

    @property
    def is_secretariado(self):
        return "secretariado" in self.profiles or "administrador" in self.profiles

    @property
    def is_admin_profile(self):
        return "administrador" in self.profiles

    @property
    def tipo(self):
        """Tipo apresentado no frontend (docente/estudante)."""
        return "estudante" if self.email.endswith("@alunos.uevora.pt") else "docente"
