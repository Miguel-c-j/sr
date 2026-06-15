from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, name, password, **extra_fields):
        if not email:
            raise ValueError("O email e obrigatorio.")
        email = self.normalize_email(email).lower()
        user = self.model(email=email, name=name, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_user(self, email, name="", password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, name, password, **extra_fields)

    def create_superuser(self, email, name="", password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("profiles", ["administrador"])
        extra_fields.setdefault("building_access", ["all"])
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser tem de ter is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser tem de ter is_superuser=True.")
        return self._create_user(email, name, password, **extra_fields)
