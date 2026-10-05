# Multi-stage Dockerfile for Riwi Cine Backend (NestJS)

# 1. Build Stage
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 2. Production Stage
FROM node:22-alpine AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /usr/src/app/dist ./dist

# Create non-root user for security
USER node

EXPOSE 3000

CMD ["node", "dist/main"]
