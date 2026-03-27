# Makefile
up:
	docker compose --env-file ./iam-js/.env up --build -d

down:
	docker compose down

logs:
	docker compose logs -f