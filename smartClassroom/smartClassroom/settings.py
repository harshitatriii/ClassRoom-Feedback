"""
Django settings for smartClassroom project.
"""

import os
from pathlib import Path
import dj_database_url
import nltk

BASE_DIR = Path(__file__).resolve().parent.parent

# Ensure NLTK can find corpora in project directory
NLTK_DATA_DIR = str(BASE_DIR / 'nltk_data')
nltk.data.path.insert(0, NLTK_DATA_DIR)
os.environ['NLTK_DATA'] = NLTK_DATA_DIR

# Auto-download corpora if missing (handles ephemeral filesystems)
try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab', download_dir=NLTK_DATA_DIR, quiet=True)
try:
    nltk.data.find('corpora/brown')
except LookupError:
    nltk.download('brown', download_dir=NLTK_DATA_DIR, quiet=True)
try:
    nltk.data.find('taggers/averaged_perceptron_tagger')
except LookupError:
    nltk.download('averaged_perceptron_tagger', download_dir=NLTK_DATA_DIR, quiet=True)
try:
    nltk.data.find('corpora/conll2000')
except LookupError:
    nltk.download('conll2000', download_dir=NLTK_DATA_DIR, quiet=True)
try:
    nltk.data.find('corpora/movie_reviews')
except LookupError:
    nltk.download('movie_reviews', download_dir=NLTK_DATA_DIR, quiet=True)

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-cu36vayh)9ilj35y_zyfpy(_9=qj6*m(4djqmc@)wwl8a*o@c(')

DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    # Local apps
    'accounts',
    'core',
    'courses',
    'feedback',
    'analysis',
    'livefeedback',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'smartClassroom.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'smartClassroom.wsgi.application'

DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR / "db.sqlite3"}'
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom user model
AUTH_USER_MODEL = 'accounts.CustomUser'

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    origin for origin in
    os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:5173').split(',')
    if origin.strip()
]
