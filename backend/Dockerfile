# --- Stage 1: Build ---
FROM node:20 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build

# --- Stage 2: Production ---
FROM node:20-alpine AS prod
WORKDIR /app
# Install Python and build tools for native modules (bcrypt, pg, etc.)
RUN apk add --no-cache python3 make g++
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
# Install production dependencies in Alpine to avoid glibc/musl mismatch
RUN npm ci --only=production
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "dist/app.js"]
