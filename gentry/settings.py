import os

from environ import Env

BASE_DIR = os.path.realpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
envfile = os.path.join(BASE_DIR, '.env')
env = Env()
if os.path.isfile(envfile):
    env.read_env(envfile)

DEBUG = env.bool('DEBUG', default=False)
SECRET_KEY = env.str('SECRET_KEY', default=('x' if DEBUG else Env.NOTSET))
ALLOWED_HOSTS = ['*']

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True
STATIC_URL = '/static/'
WSGI_APPLICATION = 'gentry.wsgi.application'
ROOT_URLCONF = 'gentry.urls'
LOGIN_URL = '/admin/login/'
URL_BASE = env.str('URL_BASE', default=('http://localhost:8000' if DEBUG else None))
GOTIFY_IMMEDIATE = env.bool('GOTIFY_IMMEDIATE', default=False)
GOTIFY_IMMEDIATE_THREAD = env.bool('GOTIFY_IMMEDIATE_THREAD', default=False)
DEFAULT_AUTO_FIELD = 'django.db.models.AutoField'

INSTALLED_APPS = [
    'gentry',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'polymorphic',
    'gore',
    'gontend',
    'gotify',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'gentry.middleware.GentryWhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'gentry.middleware.url_root_middleware',
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

DATABASES = {
    'default': env.db_url('DATABASE_URL', default=f"sqlite:///{os.path.join(BASE_DIR, 'db.sqlite3')}"),
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]
if DEBUG:
    AUTH_PASSWORD_VALIDATORS = []
