FROM webdevops/php-nginx:8.4-alpine

# Set working directory (default webdevops root is /app, so public is /app/public)
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache sqlite-dev zip unzip git curl

# Copy composer files first to leverage Docker cache
COPY composer.json composer.lock ./

# Install dependencies (no dev dependencies for production)
RUN composer install --no-interaction --no-plugins --no-scripts --no-dev --prefer-dist

# Copy the rest of the application files
COPY . .

# Run autoloader optimization
RUN composer dump-autoload --no-dev --optimize

# Create SQLite database if it doesn't exist and set correct permissions
# Note: webdevops image uses the user 'application' to run Nginx and PHP
RUN touch database/database.sqlite \
    && mkdir -p storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache \
    && chown -R application:application /app

# Set environment variables for the Nginx document root
ENV WEB_DOCUMENT_ROOT=/app/public
ENV APP_ENV=production
ENV APP_DEBUG=false

EXPOSE 80
