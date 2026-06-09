#!/bin/bash
set -e

cd /var/www/html

echo "==> Checking APP_KEY..."
if [ -z "$APP_KEY" ]; then
    echo "ERROR: APP_KEY environment variable is not set!"
    echo "Run: php artisan key:generate --show  and set APP_KEY in your environment."
    exit 1
fi

echo "==> Writing .env from environment variables..."
if [ ! -f ".env" ]; then
    cp .env.example .env
fi

echo "==> Running database migrations..."
php artisan migrate --force

echo "==> Creating storage symlink..."
php artisan storage:link --force 2>/dev/null || true

echo "==> Caching config, routes and views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> Fixing permissions on storage..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

echo "==> Starting services via supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
