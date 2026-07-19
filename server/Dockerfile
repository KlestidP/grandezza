FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate

ENV NODE_ENV=production
EXPOSE 3000

# Applies any pending migrations, then starts the server. Safe to run on
# every deploy: migrate deploy is non-interactive and a no-op if nothing's
# pending.
CMD npx prisma migrate deploy && npm start
