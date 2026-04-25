DB_CONTAINER_NAME=guitapp-db
DB_NAME=guitapp
DB_PASSWORD=password
DB_USER=postgres
DB_PORT=5432

.PHONY: db-up db-down db-status

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
