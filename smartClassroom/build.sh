#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

# Download NLTK data to project directory so it persists at runtime
export NLTK_DATA=$PWD/nltk_data
python -m textblob.download_corpora
python -c "import nltk; nltk.download('punkt_tab', download_dir='$PWD/nltk_data')"

python manage.py collectstatic --no-input
python manage.py migrate

# Seed data (uses get_or_create, safe to run multiple times)
python seed_data.py

# Backfill sentiment analysis for any feedbacks missing it
python manage.py backfill_sentiment

# Create superuser from env vars (skip if already exists)
if [ -n "$DJANGO_SUPERUSER_USERNAME" ]; then
  python manage.py createsuperuser --no-input || true
  # Ensure superuser has admin role
  python -c "
import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'smartClassroom.settings')
import django; django.setup()
from accounts.models import CustomUser
CustomUser.objects.filter(is_superuser=True).update(role='admin')
print('Superuser role set to admin')
"
fi
