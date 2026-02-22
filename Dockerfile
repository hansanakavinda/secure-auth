# ---- Stage 1: Base ----
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ---- Stage 2: Dependencies ----
FROM base AS deps
COPY package.json package-lock.json ./
# Prisma schema + config must be present for the postinstall `prisma generate`
COPY prisma ./prisma
COPY prisma.config.ts ./
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN npm ci

# ---- Stage 3: Builder ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma needs a DATABASE_URL at generate time (not used for actual connection)
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

# Generate Prisma client and build Next.js
RUN npx prisma generate
RUN npm run build

# ---- Stage 4: Runner (Production) ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy generated Prisma client (required at runtime)
COPY --from=builder --chown=nextjs:nodejs /app/prisma/generated ./prisma/generated

# Copy Prisma schema (needed for runtime query engine resolution)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
