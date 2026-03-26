# Docker Reference

Useful Docker commands for running and managing the IAMJs application.

## Start

| Command | Description |
|---|---|
| `docker compose up --build` | Build and start all containers |
| `docker compose up --build -d` | Build and start in background |

## Stop

| Command | Description |
|---|---|
| `docker compose down` | Stop and remove containers |
| `docker compose down -v` | Stop, remove containers and delete database volume |

## Logs

| Command | Description |
|---|---|
| `docker compose logs` | Show logs from all containers |
| `docker compose logs app` | Show logs from the NestJS container |
| `docker compose logs db` | Show logs from the PostgreSQL container |
| `docker compose logs -f app` | Stream live logs from the NestJS container |

## Status

| Command | Description |
|---|---|
| `docker compose ps` | List running containers |

## Restart

| Command | Description |
|---|---|
| `docker compose restart app` | Restart the NestJS container |
| `docker compose restart db` | Restart the PostgreSQL container |

## Reset

> ⚠️ This will delete all your database data.
```bash
docker compose down -v
docker compose up --build
```