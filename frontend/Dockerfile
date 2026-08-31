# ============ Build stage ============
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies based on the lockfile for reproducibility
COPY package.json package-lock.json ./
RUN npm ci

# Copy the application source and build the production bundle
COPY . .
RUN npm run build

# ============ Runtime stage ============
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Create a non-root user to run the Next.js server
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy the standalone Next.js server and its bundled node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copy pre-rendered static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000 \
    HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
