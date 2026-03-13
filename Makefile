include .env
LATEST_SQL_FILE := $(shell ls -t backup/*.sql 2>/dev/null | head -n1)
LATEST_GZ_FILE := $(shell ls -t backup/*.gz 2>/dev/null | head -n1)

.PHONY: all
all: build copy

run-client:
	cd client && yarn dev

run-node:
	cd scripts && ts-node index.ts

format:
	cd scripts && npx prettier --write run.ts

prod-server: 
	docker compose up -d --build time-recorder-db time-recorder-server time-recorder-nginx

.PHONY: certbot
certbot:
	docker compose -f docker compose-pro.yml up --abort-on-container-exit --exit-code-from certbot --build time-recorder-certbot certbot

dev:
	docker compose up --build time-recorder-db time-recorder-server-dev time-recorder-next-dev

.PHONY: build
build:
	docker compose build time-recorder-server time-recorder-nginx
	docker save -o ./build/server.tar time-recorder-server:latest
	docker save -o ./build/client.tar time-recorder-nginx:latest

copy:
	scp -i .ssh/$(KEY_NAME) -r build root@$(SERVER_IP):/root/time-tracking

deploy:
	cd ./build && docker load -i client.tar
	cd ./build && docker load -i server.tar
	docker compose -f docker compose-pro.yml up -d --build time-recorder-db time-recorder-server time-recorder-nginx time-recorder-pgadmin4

ssh-keygen:
	ssh-keygen -t ed25519 -C "$(PGADMIN_DEFAULT_EMAIL)"

ssh-copy-id:
	ssh-copy-id -i ./.ssh/$(KEY_NAME).pub root@$(SERVER_IP)

backup-db:
	docker compose exec -t time-recorder-db pg_dumpall -c -U admin > ./backup/dump_$$(date +%Y-%m-%d_%H_%M_%S).sql

backup-db-zip:
	docker compose exec -t time-recorder-db pg_dumpall -c -U admin | gzip > ./backup/dump_$$(date +"%Y-%m-%d_%H_%M_%S").gz

remove-db:
	docker compose exec -it time-recorder-db psql -U admin -d timerecord -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

restore-db:
	cat ./$(LATEST_SQL_FILE) | docker compose exec -T time-recorder-db psql -U admin -d timerecord

restore-db-zip:
	gunzip < ./$(LATEST_GZ_FILE) | docker compose exec -T time-recorder-db psql -U admin -d timerecord

migrate:
	docker compose exec time-recorder-server uv run python manage.py migrate

migrations:
	docker compose exec time-recorder-server uv run python manage.py makemigrations

createsuperuser:
	docker compose exec time-recorder-server uv run python manage.py createsuperuser