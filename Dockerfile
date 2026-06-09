# ─── Production image ─────────────────────────────────────────────────────────
# Frontend assets (public/build/) must be compiled locally before building:
#   npm run build
#   docker compose up --build
FROM php:8.4-fpm AS production

LABEL maintainer="Iztok Vozlič"

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    libpq-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libwebp-dev \
    libfreetype6-dev \
    libzip-dev \
    libicu-dev \
    zip \
    unzip \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions (gd z jpeg/webp/freetype za image konverzije Spatie MediaLibrary)
RUN docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        gd \
        zip \
        bcmath \
        opcache \
        intl \
        pcntl \
        exif

# Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/bin --filename=composer

WORKDIR /var/www/html

# PHP dependencies (cached layer — spremenijo se redko)
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-interaction \
    --optimize-autoloader \
    --prefer-dist

# Application source (vključuje pre-built public/build/)
COPY . .

RUN composer dump-autoload --optimize --no-dev

# Permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Docker configs
COPY docker/nginx/default.conf /etc/nginx/sites-available/default
COPY docker/supervisord.conf   /etc/supervisor/conf.d/supervisord.conf
COPY docker/php.ini            /usr/local/etc/php/conf.d/99-app.ini
COPY docker/entrypoint.sh      /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
