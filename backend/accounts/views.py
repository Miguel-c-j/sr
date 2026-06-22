from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import UserSerializer
from .validators import default_profile_for_email, is_institutional_email


def _tokens_response(user):
    """Resposta padrao de autenticacao: tokens JWT + utilizador."""
    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        }
    )


def _get_or_create_institutional_user(email, name=""):
    """Procura/cria um utilizador a partir de um email institucional ja validado."""
    return User.objects.get_or_create(
        email=email,
        defaults={
            "name": name or email.split("@")[0].replace(".", " ").title(),
            "profiles": [default_profile_for_email(email)],
        },
    )


class LoginView(APIView):
    """Login simplificado por email institucional (sem password).

    Valida o dominio e devolve tokens JWT. Se o utilizador ainda nao existir,
    e criado com o perfil correspondente ao dominio do email.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()

        if not email:
            return Response(
                {"detail": "Email obrigatorio."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not is_institutional_email(email):
            return Response(
                {"detail": "Utilize um email institucional (@uevora.pt ou @alunos.uevora.pt)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user, _created = _get_or_create_institutional_user(email)

        if not user.is_active:
            return Response(
                {"detail": "Conta inativa."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return _tokens_response(user)


class GoogleLoginView(APIView):
    """Login com Google: recebe o ID token (credential) do Google Identity Services,
    verifica-o, valida o dominio institucional e devolve tokens JWT.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        if not settings.GOOGLE_CLIENT_ID:
            return Response(
                {"detail": "Login Google nao esta configurado no servidor (GOOGLE_CLIENT_ID)."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        credential = request.data.get("credential")
        if not credential:
            return Response(
                {"detail": "Credencial Google em falta."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verificacao do ID token contra os servidores da Google.
        try:
            from google.auth.transport import requests as google_requests
            from google.oauth2 import id_token

            info = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
                # Tolera pequenas diferencas de relogio entre a maquina e a Google.
                clock_skew_in_seconds=10,
            )
        except Exception as exc:
            detail = "Token Google invalido."
            if settings.DEBUG:
                detail = f"Token Google invalido: {type(exc).__name__}: {exc}"
            return Response(
                {"detail": detail},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not info.get("email_verified"):
            return Response(
                {"detail": "Email Google nao verificado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = (info.get("email") or "").strip().lower()
        if not is_institutional_email(email):
            return Response(
                {"detail": "Use uma conta institucional (@uevora.pt ou @alunos.uevora.pt)."},
                status=status.HTTP_403_FORBIDDEN,
            )

        name = info.get("name") or ""
        user, _created = _get_or_create_institutional_user(email, name=name)

        if not user.is_active:
            return Response(
                {"detail": "Conta inativa."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return _tokens_response(user)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("name")
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "delete", "head", "options"]
