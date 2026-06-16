# Backend — Sistema de Reservas (Django + DRF + PostgreSQL)

API REST para o sistema de reservas de salas da Universidade de Évora.
Construída para encaixar diretamente no frontend React existente (`src/services/api.js`).

## Stack

- Django 5 + Django REST Framework
- Autenticação JWT (djangorestframework-simplejwt)
- PostgreSQL (via Docker)

## Arrancar (desenvolvimento)

```bash
cd backend

# 1. Base de dados PostgreSQL
docker compose up -d

# 2. Ambiente Python
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 3. Configuração (opcional — há defaults que batem com o docker-compose)
cp .env.example .env

# 4. Migrações + dados de demonstração
python manage.py migrate
python manage.py seed_demo

# 5. Servidor
python manage.py runserver 127.0.0.1:8000
```

A API fica em `http://localhost:8000/api/` (a mesma `API_BASE_URL` do frontend).

## Autenticação

A app entra **só por login com Google** (email institucional). O backend verifica o
ID token do Google, valida o domínio (`@uevora.pt` / `@alunos.uevora.pt`) e devolve
tokens JWT:

```
POST /api/users/google-login/
{ "credential": "<google-id-token>" }
-> { "access": "...", "refresh": "...", "user": { ... } }
```

Requer `GOOGLE_CLIENT_ID` em `backend/.env` (e `VITE_GOOGLE_CLIENT_ID` no frontend).
Ver secção 11.1 do `DOCUMENTACAO.md` para a configuração no Google Cloud.

Existe ainda um endpoint **legado** por email (sem password), **não usado pela UI** —
útil para testar a API sem configurar o Google:

```
POST /api/users/login/
{ "email": "secretariado@uevora.pt" }
-> { "access": "...", "refresh": "...", "user": { ... } }
```

Em ambos, se o email for válido mas o utilizador não existir, é criado automaticamente
com o perfil correspondente ao domínio (`@alunos` -> aluno, `@uevora` -> docente).
Os pedidos autenticados usam `Authorization: Bearer <access>`.

Utilizadores de demonstração (criados pelo `seed_demo`):

| Email | Perfil |
|-------|--------|
| `admin@uevora.pt` | administrador |
| `secretariado@uevora.pt` | secretariado |
| `professor@uevora.pt` | docente |
| `aluno@alunos.uevora.pt` | aluno |

> Pela UI só entras como uma destas contas se tiveres acesso ao respetivo email Google;
> caso contrário usa o endpoint legado `/api/users/login/` acima para testes.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/users/google-login/` | Login com Google (ID token) — **único login da app** |
| POST | `/api/users/login/` | Login por email — legado, só dev (não usado pela UI) |
| GET/PATCH/DELETE | `/api/users/` | Gestão de utilizadores (perfis, acessos) |
| GET/POST/PUT/DELETE | `/api/buildings/` | Edifícios (`roomCount`) |
| GET/POST/PUT/DELETE | `/api/equipment/` | Equipamentos (`code`, `usageCount`) |
| GET/POST/PUT/DELETE | `/api/rooms/` | Salas (filtros: `building`, `minCapacity`, `room`, `roomTypes`, `equipment`, `date`) |
| GET | `/api/rooms/{id}/availability/?date=` | Horário (livre/ocupado/reservado) |
| GET | `/api/reservations/my_reservations/` | Reservas do utilizador autenticado |
| POST | `/api/reservations/` | Criar reserva (verifica conflitos) |
| POST | `/api/reservations/{id}/cancel/` | Cancelar |
| POST | `/api/reservations/{id}/approve/` | Aprovar (secretariado) |
| POST | `/api/reservations/{id}/reject/` | Rejeitar com `reason` (secretariado) |
| GET | `/api/reservations/pending/` | Pedidos pendentes (secretariado) |
| GET | `/api/reservations/history/` | Histórico (secretariado) |
| POST | `/api/imports/` | Importar CSV (secretariado) |
| GET | `/api/imports/template/?type=` | Descarregar template CSV |

### Criar reserva

```
POST /api/reservations/
{ "roomId": 1, "data": "2026-09-20", "horaInicio": "10:00", "horaFim": "12:00", "proposito": "..." }
```

### Importar CSV

`multipart/form-data` com `type` (`horarios_aulas` | `horarios_exames` |
`calendario_letivo`) e `file`. Colunas esperadas:

```
edificio,sala,data,hora_inicio,hora_fim,proposito,docente_email
```

(`docente_email` é opcional — sem ele, a reserva fica associada a quem importa.)
Resposta no formato esperado pelo frontend:

```json
{ "success": false, "totalRecords": 4, "successCount": 1, "errorCount": 3,
  "errors": [{ "row": 3, "message": "Edificio nao encontrado" }] }
```

## Modelo de dados

- **User**: email institucional, `name`, `department`, `profiles[]` (vários perfis),
  `building_access` (lista de ids ou `["all"]`).
- **Building**: `name`, `address`.
- **Equipment**: `code` (slug usado pelas salas), `name`, `icon`.
- **Room**: `name`, `building` (FK — uma sala num só edifício), `capacity`, `type`,
  `equipment` (M2M — vários equipamentos).
- **Reservation**: `room`, `user`, `date`, `start_time`, `end_time`, `purpose`,
  `status` (pendente/confirmada/cancelada/rejeitada), `priority`, `rejection_reason`,
  `is_imported`, `created_at`, `updated_at`.

## Notas

- Os perfis de acesso são determinados pelos `profiles` do utilizador no servidor.
  Após o login (Google), o `LoginPage.jsx` usa `data.user.profiles`: com 2+ perfis
  mostra a página de seleção de perfil, senão entra direto.
- As páginas do frontend estão ligadas ao backend via `src/services/api.js` (sem
  mocks), incluindo `getPendingReservations`, `getReservationHistory` e `importData`.
