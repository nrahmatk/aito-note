FROM php:8.4-fpm-alpine

# Install system dependencies and PHP extensions
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    sqlite-dev \
    oniguruma-dev \
    libzip-dev

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_sqlite bcmath mbstring xml gd zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy composer files first to leverage Docker cache
COPY composer.json composer.lock ./

# Install dependencies (ignoring scripts for now until the full code is copied)
RUN composer install --no-interaction --no-plugins --no-scripts --no-dev --prefer-dist

# Copy the rest of the application files
COPY . .

# Finish composer installation (running autoloader, scripts, and plugins)
RUN composer dump-autoload --no-dev --optimize

# Ensure storage and bootstrap/cache directories exist and have proper permissions
RUN mkdir -p storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache \
    && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Expose port 9000 for php-fpm
EXPOSE 9000

CMD ["php-fpm"]
