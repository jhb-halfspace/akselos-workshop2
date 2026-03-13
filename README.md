# Akselos Time Recorder - for halfspace workshop

This repository contains the Akselos Time Recorder application, including the Django backend, Next.js frontend, and various automation scripts.

---

## 🛠 Local Development

### 1. Prerequisites
Ensure you have the following installed:
- **Docker** and **Docker Compose**
- **Make** (for using shortcut commands)

### 2. Environment Setup
Rename the template environment files to `.env`:
```bash
cp .localenv .env
cp client/.localenv client/.env
```
Open the root `.env` file and ensure `DEBUG=True` is set for local development. This enables hot-reloading and development-friendly CORS/CSRF settings.

### 3. Start the Services
Launch the entire stack using Docker Compose:
```bash
docker compose up --build -d
```

### 4. Database Initialization
Once the containers are running, apply the database migrations:
```bash
make migrate
```

### 5. Create a Superuser
To access the Django Admin Dashboard, you need an administrative account:
```bash
make createsuperuser
```
Follow the interactive prompts to set your username and password.

### 6. Access the Application
- **Frontend (Nginx):** [http://localhost:8080](http://localhost:8080)
- **Backend API:** [http://localhost:7789/api](http://localhost:7789/api)
- **Django Admin:** [http://localhost:7789/admin](http://localhost:7789/admin)
- **PostgreSQL:** Accessible on `localhost:5433` (mapped from container port 5432).

---

## 🚀 Production Deployment

### 1. Prerequisites
- A server with Docker and Docker Compose installed.
- A registered domain name (e.g., `tr.akselos.com`).

### 2. Production Configuration
1. Rename `.localenv` to `.env` and set `DEBUG=False`.
2. Configure your production variables in `.env`:
   - `API_URL`: Your full production URL.
   - `GG_CLIENT_ID` / `GG_CLIENT_SECRET`: Google OAuth2 credentials.
   - `SERVER_EMAIL` / `SERVER_PASSWORD`: SMTP credentials for daily reminders.
   - `SERVER_IP` / `KEY_NAME`: For deployment scripts.

### 3. Deployment Command
Deploy using the production-specific compose file:
```bash
docker compose -f docker-compose-pro.yml up --build -d
```

### 4. SSL Setup (Certbot)
To obtain and configure SSL certificates via Let's Encrypt:
```bash
make certbot
```

### 5. Automated Reminders
To schedule daily input reminders, add the following cronjob (runs at 4 AM and 8 AM, Mon-Fri):
```bash
0 4,8 * * 1-5 docker compose -f /path/to/project/docker-compose-pro.yml up time-recorder-send-reminder --build
```

### 6. Maintenance Commands
- **Backup Database:** `make backup-db-zip` (Creates a gzipped SQL dump in `backup/`).
- **Restore Database:** `make restore-db-zip` (Restores the latest gzipped dump from `backup/`).
- **Update Application:** Pull the latest code and run the deployment command again.

---

## 🧰 Makefile Commands Summary

| Command | Description |
| :--- | :--- |
| `make migrate` | Runs Django database migrations in the server container. |
| `make migrations` | Generates new Django migration files based on model changes. |
| `make createsuperuser` | Starts interactive superuser creation. |
| `make backup-db-zip` | Dumps the current database state to a `.gz` file. |
| `make restore-db-zip` | Restores the database from the latest `.gz` backup. |
| `make remove-db` | Drops the `public` schema (use with caution!). |
