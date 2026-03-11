#!/bin/bash

# Wait for database to be ready
echo "Waiting for database..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
echo "Database is ready!"

# Run migrations
echo "Running database migrations..."
alembic upgrade head

# Seed database
echo "Seeding database..."
python scripts/seed_data.py

# Start the application
echo "Starting application..."
exec "$@"
