# Notes Fullstack App

Laravel Sanctum API token authentication with a React + React Query frontend for protected note CRUD.

## Features

- Register, login, logout with Laravel Sanctum bearer tokens
- Protected `/api/user` and `/api/notes` routes return `401` without a valid token
- User-owned notes with create, read, update, and delete endpoints
- React frontend connected to the API with `@tanstack/react-query`
- Local CORS config for API requests from the Vite dev server

## Requirements

- PHP 8.3+
- Composer
- Node.js 22+
- pnpm

## Backend Setup

```bash
cd api-notes
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

The API runs at `http://127.0.0.1:8000/api` by default.

## Frontend Setup

```bash
cd frontend
pnpm install
pnpm dev
```

The frontend uses `http://127.0.0.1:8000/api` by default. To point it somewhere else, create `frontend/.env`:

```env
VITE_API_URL=https://your-api-host.example/api
```

## API Endpoints

- `POST /api/register`
- `POST /api/login`
- `POST /api/logout` protected
- `GET /api/user` protected
- `GET /api/notes` protected
- `POST /api/notes` protected
- `GET /api/notes/{note}` protected
- `PUT /api/notes/{note}` protected
- `DELETE /api/notes/{note}` protected

Use the returned token as a bearer token:

```http
Authorization: Bearer <token>
```

## Verification

Backend tests:

```bash
cd api-notes
php artisan test
```

Frontend build:

```bash
cd frontend
pnpm build
```

## Deployment Notes

- Backend: deploy `api-notes` to a Laravel-capable host such as Laravel Cloud, Forge, Render, Railway, or a VPS. Set production `.env`, run migrations, and point the web root to `public`.
- Frontend: deploy `frontend` to Vercel, Netlify, Cloudflare Pages, or another static host. Set `VITE_API_URL` to the deployed backend API URL before building.
- CORS: replace `allowed_origins => ['*']` in `api-notes/config/cors.php` with the deployed frontend origin for production hardening.
