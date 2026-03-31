#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

python -m textblob.download_corpora

python manage.py collectstatic --no-input
python manage.py migrate

# Seed data (uses get_or_create, safe to run multiple times)
python seed_data.py

# Create superuser from env vars (skip if already exists)
if [ -n "$DJANGO_SUPERUSER_USERNAME" ]; then
  python manage.py createsuperuser --no-input || true
fi
