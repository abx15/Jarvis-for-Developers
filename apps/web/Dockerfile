# Build Stage
FROM node:18-alpine AS builder
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate
WORKDIR /app

# Copy package files
COPY apps/web/package.json ./apps/web/
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the entire project
COPY . .

# Build the frontend
RUN pnpm --filter @ai-dev-os/web build

# Production Stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Copy build artifacts
COPY --from=builder /app/apps/web/next.config.js ./
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json

EXPOSE 3001

CMD ["pnpm", "start", "--filter", "@ai-dev-os/web"]
