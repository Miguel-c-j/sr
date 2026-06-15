from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import UserSerializer
from .validators import default_profile_for_email, is_institutional_email


class LoginView(APIView):
    """Login simplificado por email institucional.

    Aceita {email} (a password e ignorada). Valida o dominio e devolve tokens
    JWT. Se o utilizador ainda nao existir, e criado com o perfil correspondente
    ao dominio do email.
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

        user, _created = User.objects.get_or_create(
            email=email,
            defaults={
                "name": email.split("@")[0].replace(".", " ").title(),
                "profiles": [default_profile_for_email(email)],
            },
        )

        if not user.is_active:
            return Response(
                {"detail": "Conta inativa."},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            }
        )


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("name")
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "delete", "head", "options"]
