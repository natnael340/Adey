#!/bin/bash

# Generate environment file for CI/CD pipeline
cat > .staging.env <<EOF  
# db
DB_NAME=test_db
POSTGRES_DB=test_db
POSTGRES_USER=test_user
POSTGRES_PASSWORD=password

# django
DJANGO_ENV=development
DJANGO_SECRET_KEY=test_secret_key
DATABASE_URL="postgres://test_user:password@db:5432/test_db"

# RabbitMQ settings
RABBITMQ_DEFAULT_USER=test_user
RABBITMQ_DEFAULT_PASS=password
CELERY_BROKER_URL="amqp://test_user:password@broker:5672"
CELERY_RESULT_BROKER_URL="amqp://test_user:password@broker:5672"

# ASGI Channel layer config
RABBITMQ_ASGI_URL="amqp://test_user:password@broker:5672/asgi"
EOF
