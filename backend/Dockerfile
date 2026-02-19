# ── Base ──────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ── Development ───────────────────────────────────────────────────────────────
FROM base AS development
COPY package.json ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate
COPY . .
CMD ["npm", "run", "start:dev"]

# ── Builder ───────────────────────────────────────────────────────────────────
FROM base AS builder
COPY package.json ./
RUN npm install
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .
RUN npm run build

# ── Production ────────────────────────────────────────────────────────────────
FROM base AS production
COPY package.json ./
COPY prisma ./prisma/
# Install all deps (prisma CLI needed for migrate deploy at runtime)
RUN npm install && npx prisma generate
COPY --from=builder /app/dist ./dist
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/main.js"]
