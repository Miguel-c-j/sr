# Sistema de Reservas de Salas — Universidade de Évora

Documentação técnica completa do projeto: arquitetura, frontend, backend, base de
dados, integração entre as camadas e instruções para executar tudo localmente.

> Objetivo do sistema: permitir que **alunos** e **docentes** reservem salas, que o
> **secretariado** aprove/rejeite pedidos, consulte histórico e importe horários por
> CSV, e que o **administrador** faça a gestão de salas, equipamentos, edifícios e
> utilizadores.

---

## Índice

1. [Visão geral e arquitetura](#1-visão-geral-e-arquitetura)
2. [Stack tecnológica](#2-stack-tecnológica)
3. [Estrutura de pastas](#3-estrutura-de-pastas)
4. [Perfis de acesso](#4-perfis-de-acesso)
5. [Frontend (React)](#5-frontend-react)
6. [Backend (Django + DRF)](#6-backend-django--drf)
7. [Base de dados](#7-base-de-dados)
8. [Integração frontend ↔ backend](#8-integração-frontend--backend)
9. [Endpoints da API](#9-endpoints-da-api)
10. [Importação de CSV](#10-importação-de-csv)
11. [Como correr o projeto](#11-como-correr-o-projeto)
12. [Contas e dados de demonstração](#12-contas-e-dados-de-demonstração)
13. [Resolução de problemas](#13-resolução-de-problemas)

---

## 1. Visão geral e arquitetura

O projeto está dividido em duas aplicações independentes que comunicam por **HTTP/JSON**:

```
┌────────────────────────┐         HTTP + JWT          ┌──────────────────────────┐
│   FRONTEND (React)      │  ───────────────────────►   │   BACKEND (Django + DRF)  │
│   Vite • porta 5173     │   fetch() em api.js         │   porta 8000  /api/...     │
│                         │  ◄───────────────────────   │                            │
│  Páginas + Componentes  │      respostas JSON         │   Views / Serializers      │
└────────────────────────┘                             └─────────────┬──────────────┘
                                                                      │ ORM
                                                                      ▼
                                                          ┌──────────────────────────┐
                                                          │   PostgreSQL (Docker)     │
                                                          │   porta 5432              │
                                                          └──────────────────────────┘
```

- O **frontend** é uma Single Page Application (SPA). Não tem lógica de negócio: pede
  dados à API e mostra-os.
- O **backend** é uma API REST que valida regras (conflitos de reserva, permissões,
  validação de email institucional) e persiste tudo em PostgreSQL.
- A **autenticação** usa **JWT** (JSON Web Tokens): o frontend faz login, guarda o
  token e envia-o em cada pedido no cabeçalho `Authorization: Bearer <token>`.

---

## 2. Stack tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React | 19 |
| | Vite (build/dev server) | 8 |
| | React Router | 7 |
| | react-icons | — |
| Backend | Python | 3.12 |
| | Django | 5.1 |
| | Django REST Framework | 3.15 |
| | djangorestframework-simplejwt (JWT) | 5.4 |
| | django-cors-headers | 4.6 |
| Base de dados | PostgreSQL (em Docker) | 16 |

---

## 3. Estrutura de pastas

```
sr/
├── index.html                 # Ponto de entrada do Vite
├── vite.config.js
├── eslint.config.js           # Regras de lint (ignora 'backend' e 'node_modules')
├── package.json
│
├── src/                       # ========== FRONTEND ==========
│   ├── main.jsx               # Bootstrap do React (+ GoogleOAuthProvider)
│   ├── App.jsx                # Rotas + proteção de rotas por perfil
│   ├── index.css
│   │
│   ├── services/
│   │   ├── api.js             # ⭐ Camada de acesso à API (todas as chamadas fetch)
│   │   └── auth.js            # Lógica de perfis/sessão (perfil ativo, página inicial)
│   │
│   ├── pages/                 # Uma página por ecrã
│   │   ├── LoginPage.jsx               # Login por email + Google (sem dropdown)
│   │   ├── ProfileSelect.jsx           # Escolher perfil (quando há 2+)
│   │   ├── RoomsPage.jsx               # Pesquisar e reservar salas
│   │   ├── ReservationsPage.jsx        # "Minhas Reservas"
│   │   ├── secretariat/
│   │   │   ├── PendingRequests.jsx     # Aprovar/rejeitar pedidos
│   │   │   ├── History.jsx             # Histórico + exportar CSV
│   │   │   └── ImportData.jsx          # Importar horários CSV
│   │   └── management/                 # (só admin)
│   │       ├── ManageRooms.jsx
│   │       ├── ManageEquipment.jsx
│   │       ├── ManageBuildings.jsx
│   │       └── ManageUsers.jsx
│   │
│   ├── components/
│   │   ├── Layout/            # Header, Sidebar, Layout (moldura comum)
│   │   ├── Rooms/             # RoomCard, RoomSchedule (grelha de horários)
│   │   └── Filters/           # RoomFilters (filtros de pesquisa)
│   │
│   └── styles/                # CSS por página/área
│
└── backend/                   # ========== BACKEND ==========
    ├── manage.py              # CLI do Django
    ├── requirements.txt       # Dependências Python
    ├── docker-compose.yml     # PostgreSQL
    ├── .env.example           # Variáveis de ambiente (copiar para .env)
    │
    ├── config/                # Configuração do projeto Django
    │   ├── settings.py        # BD, apps, JWT, CORS
    │   ├── urls.py            # ⭐ Mapa de rotas /api/...
    │   ├── wsgi.py / asgi.py
    │
    ├── accounts/              # App: utilizadores + autenticação
    │   ├── models.py          # Modelo User (login por email)
    │   ├── managers.py        # UserManager
    │   ├── validators.py      # Validação @uevora.pt / @alunos.uevora.pt
    │   ├── serializers.py
    │   ├── views.py           # LoginView + GoogleLoginView + UserViewSet
    │   └── management/commands/seed_demo.py   # ⭐ Dados demo (chama também seed_clav)
    │
    ├── facilities/            # App: edifícios, equipamentos, salas
    │   ├── models.py          # Building, Equipment, Room
    │   ├── serializers.py
    │   ├── views.py           # ViewSets + disponibilidade/horário
    │   └── management/commands/seed_clav.py   # Salas reais do CLAV (SALAS CLAV.xlsx)
    │
    ├── reservations/          # App: reservas
    │   ├── models.py          # Reservation
    │   ├── utils.py           # Horários, duração, deteção de conflitos
    │   ├── serializers.py     # 3 serializers (minhas/pendentes/histórico)
    │   └── views.py           # ReservationViewSet (create/cancel/approve/reject…)
    │
    └── imports/               # App: importação de CSV
        └── views.py           # ImportView + ImportTemplateView
```

Os ficheiros marcados com ⭐ são os mais importantes para perceber o sistema.

---

## 4. Perfis de acesso

Um utilizador pode ter **vários perfis** em simultâneo. Os perfis são definidos na
**conta** (no servidor), não escolhidos no login. Se a conta tiver 2 ou mais perfis,
após autenticar é mostrada a **página de seleção de perfil** (`/selecionar-perfil`)
para escolher com qual entrar nessa sessão. Os menus e as rotas acessíveis dependem
do perfil ativo.

| Perfil | O que pode fazer | Página inicial |
|--------|------------------|----------------|
| **convidado** | Ver salas | `/salas` |
| **aluno** | Reservar salas, ver as suas reservas | `/salas` |
| **docente** | Igual ao aluno, mas com **prioridade** nas reservas | `/salas` |
| **secretariado** | Aprovar/rejeitar pedidos, ver histórico, importar CSV | `/pendentes` |
| **administrador** | Gerir salas, equipamentos, edifícios e utilizadores | `/gerir-salas` |

---

## 5. Frontend (React)

### 5.1 Fluxo de arranque

`index.html` → `src/main.jsx` → `src/App.jsx`.

O `App.jsx` define **todas as rotas** e protege-as:

- `ProtectedRoute` — exige estar autenticado (existe `user` no `localStorage`).
- `RoleBasedRoute` — exige que o perfil ativo (`user.role`) esteja na lista de perfis
  permitidos para aquela rota; caso contrário redireciona para a página inicial do
  utilizador.

Mapa de rotas:

| Rota | Página | Perfis permitidos |
|------|--------|-------------------|
| `/login` | LoginPage | (público) |
| `/selecionar-perfil` | ProfileSelect | autenticado (só útil com 2+ perfis) |
| `/salas` | RoomsPage | autenticado |
| `/reservas` | ReservationsPage | aluno, docente, admin |
| `/pendentes` | PendingRequests | secretariado, admin |
| `/historico` | History | secretariado, admin |
| `/importar` | ImportData | secretariado, admin |
| `/gerir-salas` | ManageRooms | admin |
| `/gerir-equipamentos` | ManageEquipment | admin |
| `/gerir-edificios` | ManageBuildings | admin |
| `/gerir-utilizadores` | ManageUsers | admin |

### 5.2 A camada `api.js` (peça central)

Todo o acesso ao backend passa por `src/services/api.js`. Concentra:

- A `API_BASE_URL` (`http://localhost:8000/api`).
- A gestão do **token JWT** no `localStorage` (`access_token`, `refresh_token`, `user`).
- O cabeçalho `Authorization: Bearer <token>` adicionado automaticamente.
- Um método por operação: `login`, `loginWithGoogle`, `getRooms`, `createReservation`,
  `approveReservation`, `getPendingReservations`, `importData`, etc.

Vantagem: as páginas **não sabem** detalhes de HTTP — apenas chamam `api.algumaCoisa()`.

A lógica de **perfis/sessão** está separada em `src/services/auth.js`:
`getPrimaryRole`, `getDefaultPage`, `applyRole` (grava o perfil ativo escolhido) e
`PROFILE_META` (rótulos/ícones). É partilhada pelo `LoginPage` e pelo `ProfileSelect`.

### 5.3 Autenticação (passo a passo)

Há **dois modos de login** (sem dropdown de perfil):

- **Email institucional** (sem password) → `api.login(email)` → `POST /api/users/login/`.
- **Google** (se configurado) → `api.loginWithGoogle(idToken)` → `POST /api/users/google-login/`.

Fluxo comum após autenticar:

1. O backend valida o domínio (`@uevora.pt` / `@alunos.uevora.pt`) e devolve
   `{ access, refresh, user }`. O `api.js` guarda tudo no `localStorage`.
2. O `LoginPage` olha para `user.profiles`:
   - **1 perfil** → `applyRole` define o perfil ativo e navega para a página inicial.
   - **2+ perfis** → navega para **`/selecionar-perfil`**, onde o utilizador escolhe;
     só aí o perfil ativo é gravado.
3. O `Header` e o `Sidebar` leem o `user` para mostrar nome/menus corretos.
4. Cada chamada seguinte inclui o token; ao terminar sessão, o `Header` chama
   `api.logout()` que limpa tokens + user.

> O perfil **vem sempre da conta no servidor** — nunca é escolhido livremente no ecrã.
> A seleção de perfil só permite escolher entre os perfis que a conta **já tem**.

### 5.4 Páginas principais

- **RoomsPage** — filtros obrigatórios (Data, Edifício, Capacidade) + opcionais. Ao
  pesquisar chama `api.getRooms(filtros)`; cada sala traz a **grelha de horários**
  (`schedule`) do dia escolhido. O utilizador seleciona blocos livres e submete uma
  reserva com `api.createReservation(...)`.
- **ReservationsPage** — lista as reservas do utilizador (`api.getUserReservations`),
  com filtros por estado/data e ação de cancelar (`api.cancelReservation`).
- **PendingRequests** (secretariado) — lista pedidos pendentes
  (`api.getPendingReservations`), com aprovar (individual ou em lote) e rejeitar com
  motivo.
- **History** (secretariado) — escolhe edifício+sala e vê o histórico
  (`api.getReservationHistory`); permite exportar para CSV (gerado no browser).
- **ImportData** (secretariado) — envia um CSV (`api.importData`) e mostra o resumo de
  sucessos/erros linha a linha.
- **Manage\*** (admin) — CRUD de salas, equipamentos, edifícios e utilizadores.

### 5.5 Componentes reutilizáveis

- **Layout / Header / Sidebar** — moldura comum; o menu lateral muda conforme o perfil.
- **RoomCard** — cartão de uma sala com a sua grelha de horários e botão de reservar.
- **RoomSchedule** — grelha de blocos de 30 min (08:00–22:00) com estados
  `livre / ocupado / reservado / selecionado`. Só os blocos `livre` são selecionáveis.
- **RoomFilters** — barra lateral de filtros de pesquisa de salas.

---

## 6. Backend (Django + DRF)

O backend está organizado em **4 apps**, cada uma com uma responsabilidade clara.

### 6.1 `accounts` — utilizadores e autenticação

- **Modelo `User`** (login por email em vez de username):
  - `email` único e validado (só `@uevora.pt` ou `@alunos.uevora.pt`);
  - `name`, `department`;
  - `profiles` — lista de perfis (ArrayField), ex.: `['docente','secretariado']`;
  - `building_access` — edifícios a que o secretariado acede (`['all']` ou lista de ids).
- **`LoginView`** — login simplificado por email (sem password): valida o domínio e,
  se o utilizador não existir, **cria-o automaticamente** com o perfil correspondente
  ao domínio (`@alunos` → aluno, `@uevora` → docente). Devolve tokens JWT + user.
- **`UserViewSet`** — listar, editar (perfis/acessos) e eliminar utilizadores.

### 6.2 `facilities` — edifícios, equipamentos e salas

- **`Building`**: `name`, `address`.
- **`Equipment`**: `code` (identificador usado pelo frontend, ex. `projetor`), `name`,
  `icon`.
- **`Room`**: `name`, `building` (FK — **uma sala pertence a um só edifício**),
  `capacity`, `type` (aula/laboratório/reunião/auditório), `equipment` (M2M — **uma
  sala pode ter vários equipamentos**).
- **`RoomViewSet`** — CRUD + filtros (`building`, `minCapacity`, `room`, `roomTypes`,
  `equipment`, `date`) e a ação `availability` que devolve a grelha de horários de um
  dia.

### 6.3 `reservations` — reservas

- **Modelo `Reservation`**: `room`, `user`, `date`, `start_time`, `end_time`,
  `purpose`, `status` (pendente/confirmada/cancelada/rejeitada), `priority`,
  `rejection_reason`, `is_imported`, `created_at`, `updated_at`.
- **`utils.py`** — funções de apoio:
  - `generate_slots()` / `build_schedule()` — constrói a grelha de horários de uma sala
    num dia (marca blocos confirmados como `ocupado` e pendentes como `reservado`);
  - `duration_label()` — texto da duração (ex.: "2 horas");
  - `has_conflict()` — verifica sobreposição de horários na mesma sala.
- **`ReservationViewSet`** — escolhe automaticamente um de **3 serializers** consoante
  a ação (minhas reservas / pendentes / histórico) e expõe ações personalizadas:
  `my_reservations`, `pending`, `history`, `cancel`, `approve`, `reject`. A criação
  verifica conflitos e a aprovação volta a verificar antes de confirmar.

### 6.4 `imports` — importação de CSV

- **`ImportView`** — recebe um CSV (multipart), valida **cada linha** e cria reservas
  confirmadas (`is_imported=True`). Devolve um resumo
  `{ success, totalRecords, successCount, errorCount, errors[] }`.
- **`ImportTemplateView`** — devolve um CSV-modelo para download (endpoint público).

### 6.5 Configuração (`config/settings.py`)

- Base de dados PostgreSQL lida de variáveis de ambiente (com defaults que batem com o
  `docker-compose.yml`).
- DRF com autenticação JWT por omissão e `IsAuthenticated` como permissão base.
- CORS aberto em modo `DEBUG` para facilitar o desenvolvimento com o Vite.

---

## 7. Base de dados

### 7.1 Diagrama de entidades

```
                 ┌───────────────┐
                 │   Building    │
                 │  name         │
                 │  address      │
                 └──────┬────────┘
                        │ 1
                        │
                        │ N
                 ┌──────┴────────┐         M ┌───────────────┐
                 │     Room      │───────────│   Equipment   │
                 │  name         │  (M2M)  N │  code         │
                 │  capacity     │           │  name, icon   │
                 │  type         │           └───────────────┘
                 └──────┬────────┘
                        │ 1
                        │
                        │ N
                 ┌──────┴────────┐       N   ┌───────────────┐
                 │  Reservation  │───────────│     User      │
                 │  date         │       1   │  email        │
                 │  start_time   │           │  name         │
                 │  end_time     │           │  profiles[]   │
                 │  purpose      │           │  building_access
                 │  status       │           │  department   │
                 │  priority     │           └───────────────┘
                 │  rejection_reason
                 │  is_imported  │
                 │  created_at / updated_at
                 └───────────────┘
```

### 7.2 Relações (cardinalidades)

- **Building 1 ── N Room** — uma sala pertence a **um** edifício; um edifício tem
  muitas salas. (FK `Room.building`, com `PROTECT`: não se apaga um edifício com salas.)
- **Room N ── N Equipment** — uma sala tem vários equipamentos; um equipamento está em
  várias salas. (M2M `Room.equipment`.)
- **Room 1 ── N Reservation** — cada reserva é de uma sala.
- **User 1 ── N Reservation** — cada reserva pertence a um utilizador.

### 7.3 Estados de uma reserva

```
            criar (aluno/docente)
                   │
                   ▼
              ┌──────────┐   approve (secretariado)   ┌────────────┐
              │ pendente │ ─────────────────────────► │ confirmada │
              └────┬─────┘                            └─────┬──────┘
                   │ reject (com motivo)                    │ cancel
                   ▼                                        ▼
              ┌──────────┐                            ┌────────────┐
              │ rejeitada│                            │ cancelada  │
              └──────────┘                            └────────────┘
```

---

## 8. Integração frontend ↔ backend

O frontend e o backend foram desenhados para encaixarem diretamente: os **nomes dos
campos** das respostas da API são exatamente os que as páginas esperam.

### Exemplo 1 — criar uma reserva

```
RoomsPage (browser)                 api.js                    backend
─────────────────                   ──────                    ───────
seleciona blocos
clica "Confirmar"  ─────────►  api.createReservation({       POST /api/reservations/
                                 roomId, data,                 ├─ valida horas e conflitos
                                 horaInicio, horaFim,          ├─ cria Reservation (pendente)
                                 proposito })                  └─ devolve a reserva criada
                               ◄───────────────────────────── 201 + JSON
mostra "aguarda aprovação"
```

### Exemplo 2 — aprovar (secretariado)

```
PendingRequests  ──►  api.approveReservation(id)  ──►  POST /api/reservations/{id}/approve/
                                                          ├─ confirma permissão (secretariado)
                                                          ├─ re-verifica conflitos
                                                          └─ status = confirmada
```

### Mapeamento de campos (PT no domínio, EN onde o frontend usava EN)

- **Reservas** (minhas reservas): `sala{nome,edificio,capacidade,tipo}`, `data`,
  `horaInicio`, `horaFim`, `estado`, `proposito`, `criadoEm`, `ultimaAtualizacao`,
  `motivoRejeicao`.
- **Salas**: `name`, `capacity`, `buildingId`, `building` (nome), `type`,
  `equipment` (lista de códigos), `schedule`.
- **Pendentes**: `solicitante{nome,email,tipo}`, `sala{nome,edificio,capacidade}`,
  `data`, `horaInicio`, `horaFim`, `duracao`, `proposito`, `dataSubmissao`, `prioridade`.

---

## 9. Endpoints da API

Base: `http://localhost:8000/api`

| Método | Rota | Descrição | Quem |
|--------|------|-----------|------|
| POST | `/users/login/` | Login por email → tokens JWT | público |
| POST | `/users/google-login/` | Login com Google (ID token) → tokens JWT | público |
| GET/PATCH/DELETE | `/users/` | Gestão de utilizadores | admin |
| GET/POST/PUT/DELETE | `/buildings/` | Edifícios (com `roomCount`) | autenticado |
| GET/POST/PUT/DELETE | `/equipment/` | Equipamentos (com `usageCount`) | autenticado |
| GET/POST/PUT/DELETE | `/rooms/` | Salas (filtros + `schedule`) | autenticado |
| GET | `/rooms/{id}/availability/?date=` | Grelha de horários do dia | autenticado |
| GET | `/reservations/my_reservations/` | Reservas do próprio utilizador | autenticado |
| POST | `/reservations/` | Criar reserva (verifica conflitos) | aluno/docente |
| POST | `/reservations/{id}/cancel/` | Cancelar | dono / secretariado |
| POST | `/reservations/{id}/approve/` | Aprovar | secretariado |
| POST | `/reservations/{id}/reject/` | Rejeitar (com `reason`) | secretariado |
| GET | `/reservations/pending/` | Pedidos pendentes | secretariado |
| GET | `/reservations/history/` | Histórico (filtros) | secretariado |
| POST | `/imports/` | Importar CSV | secretariado |
| GET | `/imports/template/?type=` | Descarregar modelo CSV | público |

Login (exemplo):

```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H 'Content-Type: application/json' \
  -d '{"email":"secretariado@uevora.pt"}'
```

---

## 10. Importação de CSV

Envia-se `type` (`horarios_aulas` | `horarios_exames` | `calendario_letivo`) e o ficheiro.
Colunas esperadas:

```
edificio,sala,data,hora_inicio,hora_fim,proposito,docente_email
```

(`docente_email` é opcional — sem ele a reserva fica associada a quem importa.)

Cada linha válida cria uma reserva **confirmada** (`is_imported=True`). As inválidas são
reportadas com o número da linha e o motivo. Resposta:

```json
{
  "success": false,
  "totalRecords": 4,
  "successCount": 1,
  "errorCount": 3,
  "errors": [
    { "row": 3, "message": "Edificio nao encontrado" },
    { "row": 4, "message": "Formato de data invalido" },
    { "row": 5, "message": "Professor nao encontrado" }
  ]
}
```

---

## 11. Como correr o projeto

Pré-requisitos: **Docker**, **Python 3.12** e **Node ≥ 20**.

### Passo 1 — Backend

```bash
cd backend

# 1. Base de dados PostgreSQL (Docker)
docker compose up -d

# 2. Ambiente Python + dependências
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 3. (Opcional) Configuração — há defaults que batem com o docker-compose
cp .env.example .env

# 4. Migrações + dados (demo + salas reais do CLAV)
python manage.py migrate
python manage.py seed_demo        # inclui automaticamente as salas do CLAV
# (em alternativa, só o CLAV: python manage.py seed_clav)

# 5. Servidor
python manage.py runserver        # http://localhost:8000
```

### Passo 2 — Frontend (noutro terminal)

```bash
cd sr            # raiz do projeto
npm install
npm run dev      # http://localhost:5173
```

Abre **http://localhost:5173** e entra com um dos emails de demonstração.

### Comandos úteis

```bash
npm run build    # build de produção (gera dist/)
npm run lint     # análise estática (deve dar 0 erros)

python manage.py createsuperuser   # criar admin do Django (/admin/)
python manage.py seed_demo         # recriar dados de demonstração
docker compose down                # parar a base de dados
```

---

## 11.1 Configurar login com Google (opcional)

O sistema suporta dois modos de login: **email institucional** (sempre ativo) e
**Google** (ativa-se quando configurado). O perfil é determinado pela conta no
servidor; se o utilizador tiver **2 ou mais perfis**, é mostrada uma **página de
seleção de perfil** após o login.

Para ativar o botão "Entrar com Google":

1. Em [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services →
   Credentials** → *Create credentials* → **OAuth client ID** → tipo **Web application**.
2. Em **Authorized JavaScript origins** adiciona `http://localhost:5173`.
3. Copia o **Client ID** gerado (algo como `xxxx.apps.googleusercontent.com`).
4. **Frontend** — cria `.env.local` na raiz do projeto:
   ```dotenv
   VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
   ```
5. **Backend** — em `backend/.env` define o **mesmo** id:
   ```dotenv
   GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
   ```
6. Reinicia o `npm run dev` e o `runserver`.

Notas:
- Sem estas variáveis, o botão Google fica escondido e o login por email continua a
  funcionar normalmente.
- O backend **verifica** o token do Google e só aceita emails `@uevora.pt` /
  `@alunos.uevora.pt` (contas Google fora destes domínios são recusadas).
- O Client ID OAuth não é segredo (fica exposto no browser), mas é por-deployment —
  por isso vive no `.env.local` (ignorado pelo git).

---

## 12. Contas e dados de demonstração

O comando `seed_demo` cria os dados de demonstração (4 edifícios + 7 salas pequenas,
equipamentos, utilizadores e reservas de exemplo — pendentes, confirmadas e históricas)
e, no fim, chama o `seed_clav` que importa as **34 salas reais do Colégio Luís António
Verney** (ficheiro `SALAS CLAV.xlsx`). Total: **5 edifícios, 41 salas**. É idempotente
(pode correr várias vezes sem duplicar).

Login (a password é ignorada — basta o email):

| Email | Perfil | Entra em |
|-------|--------|----------|
| `admin@uevora.pt` | administrador | gestão |
| `secretariado@uevora.pt` | secretariado | pendentes |
| `professor@uevora.pt` | docente | salas |
| `aluno@alunos.uevora.pt` | aluno | salas |
| `coordenacao@uevora.pt` | secretariado + docente | **mostra a página de seleção de perfil** |

> Para entrar no admin do Django (`/admin/`) é preciso uma password — usa
> `python manage.py createsuperuser` ou define uma para o `admin@uevora.pt`.

---

## 13. Resolução de problemas

| Sintoma | Causa / solução |
|---------|-----------------|
| `404` em `http://localhost:8000/` | Normal — a API está em `/api/`, não na raiz. |
| `That port is already in use` (8000) | Já há um servidor a correr nessa porta; fecha-o ou usa outra porta. |
| Login falha com "Erro de ligação ao servidor" | O backend não está a correr ou o Postgres está em baixo (`docker compose up -d`). |
| `npm: command not found` | Node não instalado / não no PATH (usa nvm e reabre o terminal). |
| Pesquisa de salas não mostra nada | Faltam os filtros obrigatórios: **Data, Edifício e Capacidade Mínima**. |
| Erro de CORS no browser | Confirma que o backend corre em `DEBUG=True` (CORS aberto) e na porta 8000. |
| `401 Unauthorized` nas chamadas | Token expirado/ausente — termina sessão e volta a entrar. |

---

### Notas finais

- O frontend não guarda lógica de negócio: as regras (conflitos, permissões, validações)
  estão **no backend**, que é a fonte de verdade.
- O perfil de acesso é determinado pelos `profiles` reais do utilizador no servidor; o
  dropdown do login serve apenas para escolher com qual perfil entrar.
- Para detalhes específicos do backend, ver também `backend/README.md`.
```
