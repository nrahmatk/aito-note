FROM nginx:alpine

# Copy custom Nginx configuration directly into the image
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy Laravel public folder so Nginx can serve static assets directly
COPY public /var/www/public

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
