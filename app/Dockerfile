# Multi-stage Dockerfile for Riwi Cine Backend (NestJS)

# ETAPA 1: BUILDER
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ETAPA 2: PRODUCTION
FROM node:22-alpine AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /usr/src/app/dist ./dist

# Principio de mínimo privilegio (Usuario No-Root)
RUN chown -R node:node /usr/src/app
USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
