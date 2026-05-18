# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files and pnpm lockfile
COPY package.json pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Pass build-time environment variables
ARG VITE_API_URL=http://localhost:8000/api
ENV VITE_API_URL=$VITE_API_URL

# Build the production bundle
RUN pnpm build

# Stage 2: Serve the build directory with Nginx
FROM nginx:alpine

# Copy the built assets to Nginx default html path
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom Nginx server block configuration for routing
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
