# Todo Workspace

A focused todo application built with a React frontend and a Django REST API. Users can create an account, sign in, and manage a private list of tasks with titles, descriptions, completion state, inline editing, deletion, and filters.

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev/)
[![Django](https://img.shields.io/badge/Django-6.1-0c4b33?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-5432-4169e1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/tests-Jest%20%2B%20Django%20REST-4c1?logo=testinglibrary&logoColor=white)](#testing)

[![Open the todo app](frontend/public/favicon.svg)](frontend/ "Open the React frontend")

## What is included

- Registration and login with JWT access and refresh tokens.
- Automatic login restoration when a valid access token is stored in the browser.
- A private todo list for each authenticated user.
- Create, read, update, and delete operations for todos.
- Completion toggles and All, To do, and Done filters.
- React component tests and Django API tests.

## Technical approach

The project is split into two small applications that communicate over JSON HTTP:

1. **React client:** Vite serves the frontend during development. `App` restores the session from `localStorage`, renders the authentication flow for signed-out users, and renders the todo workspace for signed-in users.
2. **Authentication:** The client sends credentials to Django REST Framework Simple JWT. Access and refresh tokens are stored in `localStorage`; the refresh token is used to obtain a new access token when the current one is no longer valid.
3. **API boundary:** `frontend/src/tools/auth.js` centralizes requests, JSON headers, bearer-token headers, error handling, and the token lifecycle.
4. **Django API:** The backend exposes authentication, registration, current-user, and todo endpoints. Protected views use `IsAuthenticated`, and todo queries are filtered by `request.user` so users cannot access one another's tasks.
5. **Persistence:** Django stores users and todos in PostgreSQL. Each `Todo` belongs to one Django user through a foreign key, and deleting a user cascades to their todos.

## Project structure

```text
backend/
	core/                 Django settings and project URLs
	todo/                 Todo model, serializers, views, URLs, and API tests
	manage.py
frontend/
	src/components/       Login and registration forms
	src/pages/             Authentication and todo workspace pages
	src/tools/auth.js      API and JWT client
```

## Requirements

- Python 3.10+
- Node.js 18+
- PostgreSQL running locally on port `5432`

The current backend settings expect this PostgreSQL database configuration:

```text
database: todo_db
user: postgres
password: postgres
host: localhost
port: 5432
```

Create the database and adjust `backend/core/settings.py` if your local credentials differ.

## Getting started

### 1. Start the backend

From the repository root:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment, then install the backend dependencies:

```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS/Linux
# source .venv/bin/activate

pip install django djangorestframework djangorestframework-simplejwt django-cors-headers psycopg2-binary
python manage.py migrate
python manage.py runserver
```

The API is available at `http://127.0.0.1:8000/`.

### 2. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173/`. The frontend currently calls the API at `http://127.0.0.1:8000/api/`; CORS is configured for both local Vite origins.

## API routes

| Method | Route | Purpose | Auth |
| --- | --- | --- | --- |
| `POST` | `/api/register/` | Create a user | Public |
| `POST` | `/api/token/` | Obtain access and refresh tokens | Public |
| `POST` | `/api/token/refresh/` | Refresh an access token | Refresh token |
| `GET` | `/api/me/` | Return the current user | Required |
| `GET`, `POST` | `/api/todos/` | List or create the current user's todos | Required |
| `GET`, `PUT`, `DELETE` | `/api/todos/<id>/` | Read, update, or delete one owned todo | Required |

## Testing

Run frontend tests from `frontend/`:

```bash
npm test -- --runInBand
npm run lint
npm run build
```

Run backend tests from `backend/` with the virtual environment active:

```bash
python manage.py test
```

The backend test suite covers authentication requirements, registration validation, user-scoped todo access, CRUD behavior, and invalid requests. The frontend tests cover authentication screens, session restoration, todo interactions, and the API helper.

## Next steps

- Move the API URL and database credentials into environment variables.
- Add production settings with `DEBUG = False`, a generated secret key, and restricted hosts.
- Add deployment configuration for the Django API, PostgreSQL, and the Vite build output.