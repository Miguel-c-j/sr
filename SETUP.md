# Como pôr o projeto a correr (guia rápido)

Sistema de Reservas de Salas — UÉvora. Frontend **React** + backend **Django** + **PostgreSQL**.

> Para a documentação completa (arquitetura, base de dados, API…) vê o `DOCUMENTACAO.md`.

## Pré-requisitos (instalar primeiro)

| Ferramenta | Notas |
|------------|-------|
| **Docker Desktop** | Para a base de dados PostgreSQL. **Tem de estar aberto** ("Engine running"). |
| **Python 3.12+** | Para o backend. No Windows, marca *"Add Python to PATH"* na instalação. |
| **Node.js 20+** | Para o frontend. https://nodejs.org (versão LTS). |

---

## Windows (PowerShell)

Abre o PowerShell **na pasta `sr`** (a que extraíste do zip).

### 1. Base de dados (Docker)
```powershell
cd backend
docker compose up -d
docker ps          # esperar até "reservas_db" aparecer como (healthy)
```

> **Se a porta 5432 já estiver ocupada** (tens um PostgreSQL instalado no PC), o
> contentor não arranca nessa porta. A solução mais simples é usar a **5433**:
> 1. Em `backend/docker-compose.yml` muda `"5432:5432"` para `"5433:5432"`.
> 2. No `backend/.env` (passo 3) usa `POSTGRES_PORT=5433`.

### 2. Backend — ambiente Python
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1      # tem de aparecer "(.venv)" no início da linha
pip install -r requirements.txt
```
> Se der erro de *execution policy* ao ativar:
> `Set-ExecutionPolicy -Scope Process -Bypass` e tenta o Activate de novo.
> **Confirma sempre que tens `(.venv)`** antes dos comandos seguintes.

### 3. Configuração — criar `backend/.env`
Cria o ficheiro `backend/.env` (copia do `.env.example`). Conteúdo mínimo:
```dotenv
SECRET_KEY=dev-secret-change-me
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
POSTGRES_DB=reservas
POSTGRES_USER=reservas
POSTGRES_PASSWORD=reservas
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```
> ⚠️ Se usaste a porta 5433 no passo 1, mete aqui `POSTGRES_PORT=5433`.

### 4. Criar tabelas + dados
```powershell
python manage.py migrate
python manage.py seed_demo        # cria demo + as 34 salas do CLAV
python manage.py runserver        # backend em http://localhost:8000
```

### 5. Frontend (NOVO terminal, na pasta `sr`)
```powershell
npm install
npm run dev                       # abre http://localhost:5173
```

Abre **http://localhost:5173** no browser.

---

## Linux / macOS

Igual, mudando só a ativação do venv:
```bash
cd backend
docker compose up -d
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate && python manage.py seed_demo
python manage.py runserver
# noutro terminal, na raiz:
npm install && npm run dev
```

---

## Entrar na aplicação

Login só com **email institucional** (sem password). Contas de demonstração:

| Email | Perfil |
|-------|--------|
| `admin@uevora.pt` | Administrador (gestão) |
| `secretariado@uevora.pt` | Secretariado (pendentes/histórico/importar) |
| `professor@uevora.pt` | Docente |
| `aluno@alunos.uevora.pt` | Aluno |
| `coordenacao@uevora.pt` | Vários perfis → mostra a página de seleção de perfil |

> **Login com Google** é opcional e está desativado por defeito (o botão fica escondido).
> Para o ativar é preciso um Client ID da Google Cloud — ver secção 11.1 do `DOCUMENTACAO.md`.

---

## Problemas comuns

| Erro | Solução |
|------|---------|
| `No module named 'dotenv'` | O venv não está ativo. Ativa-o (deve aparecer `(.venv)`). |
| `password authentication failed for user "reservas"` | Está a ligar a um PostgreSQL errado. Garante que o contentor Docker está a correr e que a porta no `.env` é a mesma do `docker-compose.yml`. |
| `connection refused` na 5432/5433 | O contentor não está a correr → `docker compose up -d` (Docker Desktop aberto). |
| `That port is already in use` (8000) | Já há um servidor a correr; fecha-o ou usa `python manage.py runserver 8001`. |
| `npm: command not found` | Node não instalado / não no PATH (reabre o terminal após instalar). |
| Página de salas não mostra nada | Faltam os filtros obrigatórios: **Data, Edifício e Capacidade Mínima**. |
| `404` em `http://localhost:8000/` | Normal — a API está em `/api/`. A app é o frontend (5173). |
