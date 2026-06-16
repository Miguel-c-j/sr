# Sistema de Reservas de Salas — UÉvora

Aplicação de reserva de salas da Universidade de Évora.
**Frontend** React + Vite · **Backend** Django + DRF + PostgreSQL.

## Acesso

O acesso é **exclusivamente por login com Google**, usando o email institucional
(`@uevora.pt` ou `@alunos.uevora.pt`). Não há login por password na aplicação.

- Autenticação falhada → fica na página de login com mensagem de erro.
- Autenticação bem-sucedida → entra no sistema; se a conta tiver **2+ perfis**
  (aluno, docente, secretariado, administrador), é mostrada primeiro uma página
  para escolher o perfil com que entrar; com **1 perfil** entra direto.

> O login com Google tem de ser configurado (Client ID do Google Cloud) — sem isso
> ninguém consegue entrar. Ver a secção de Google no `SETUP.md` / secção 11.1 do
> `DOCUMENTACAO.md`.

## Como correr

Resumo (precisa de Docker, Python 3.12+ e Node 20+):

```bash
# Backend
cd backend
docker compose up -d                          # PostgreSQL
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env                          # define também GOOGLE_CLIENT_ID
python manage.py migrate && python manage.py seed_demo
python manage.py runserver                    # http://localhost:8000

# Frontend (noutro terminal, na raiz)
npm install && npm run dev                    # http://localhost:5173
```

No Windows e para os passos detalhados (incluindo configurar o login Google), ver
**[`SETUP.md`](SETUP.md)**.

## Documentação

- **[`SETUP.md`](SETUP.md)** — guia rápido de instalação (Windows e Linux/macOS) e
  configuração do login com Google.
- **[`DOCUMENTACAO.md`](DOCUMENTACAO.md)** — documentação completa: arquitetura,
  perfis de acesso, base de dados, endpoints da API e resolução de problemas.
- **[`backend/README.md`](backend/README.md)** — detalhes do backend Django.
