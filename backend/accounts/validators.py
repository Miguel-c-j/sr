from django.core.exceptions import ValidationError

ALLOWED_DOMAINS = ("@uevora.pt", "@alunos.uevora.pt")


def is_institutional_email(email):
    email = (email or "").lower()
    return any(email.endswith(domain) for domain in ALLOWED_DOMAINS)


def validate_institutional_email(value):
    if not is_institutional_email(value):
        raise ValidationError(
            "O email tem de ser institucional (@uevora.pt ou @alunos.uevora.pt)."
        )


def default_profile_for_email(email):
    """Perfil atribuido automaticamente conforme o dominio do email."""
    email = (email or "").lower()
    if email.endswith("@alunos.uevora.pt"):
        return "aluno"
    return "docente"
