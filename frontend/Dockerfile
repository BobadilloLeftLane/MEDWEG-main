# --- Stage 1: Build ---
FROM node:20 AS builder
WORKDIR /app

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_API_TIMEOUT
ARG VITE_VAPID_PUBLIC_KEY
ARG VITE_APP_NAME
ARG VITE_APP_VERSION
ARG VITE_NODE_ENV

# Set environment variables from build args
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_TIMEOUT=$VITE_API_TIMEOUT
ENV VITE_VAPID_PUBLIC_KEY=$VITE_VAPID_PUBLIC_KEY
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_NODE_ENV=$VITE_NODE_ENV

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . ./

# Build the application (skip TypeScript check, Vite will bundle)
RUN npx vite build

# --- Stage 2: Production with Nginx ---
FROM nginx:alpine AS prod

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
