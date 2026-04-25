DB_CONTAINER_NAME=guitapp-db
DB_NAME=guitapp
DB_PASSWORD=password
DB_USER=postgres
DB_PORT=5432

APP_IMAGE_NAME=guitapp-backend
APP_CONTAINER_NAME=guitapp-app

.PHONY: db-up db-down db-status app-build app-up app-down

db-up:
	@if [ $$(docker ps -aq -f name=$(DB_CONTAINER_NAME)) ]; then \
		if [ $$(docker ps -q -f name=$(DB_CONTAINER_NAME)) ]; then \
			echo "Database container is already running."; \
		else \
			echo "Starting existing database container..."; \
			docker start $(DB_CONTAINER_NAME); \
		fi; \
	else \
		echo "Creating and starting new database container..."; \
		docker run --name $(DB_CONTAINER_NAME) \
			-e POSTGRES_DB=$(DB_NAME) \
			-e POSTGRES_PASSWORD=$(DB_PASSWORD) \
			-p $(DB_PORT):5432 \
			-d postgres:18; \
	fi

db-down:
	@echo "Stopping and removing database container..."
	@docker stop $(DB_CONTAINER_NAME) || true
	@docker rm $(DB_CONTAINER_NAME) || true

db-status:
	@docker ps -f name=$(DB_CONTAINER_NAME)

app-build:
	@echo "Building application image..."
	docker build -t $(APP_IMAGE_NAME) .

app-up:
	@echo "Starting application container..."
	@if [ $$(docker ps -aq -f name=$(APP_CONTAINER_NAME)) ]; then \
		docker rm -f $(APP_CONTAINER_NAME); \
	fi
	docker run --name $(APP_CONTAINER_NAME) --network="host" -d $(APP_IMAGE_NAME)

app-down:
	@echo "Stopping and removing application container..."
	@docker stop $(APP_CONTAINER_NAME) || true
	@docker rm $(APP_CONTAINER_NAME) || true
