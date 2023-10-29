FROM node:18-alpine AS base
LABEL fly_launch_runtime="Next.js"
ENV NEXT_TELEMETRY_DISABLED=1
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

FROM base AS pruned-repo
WORKDIR /app

RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=@acme/nextjs --docker

FROM base as builder
WORKDIR /app

RUN npm install -g pnpm
RUN npm install -g turbo

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=pruned-repo /app/out/json/ .
COPY --from=pruned-repo /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Build the project and its dependencies
COPY --from=pruned-repo /app/out/full/ .
COPY turbo.json turbo.json

## This would be useful for browser environment variables that are actually baked at build time and you aren't passing them in otherwise.
# COPY .env.production .env.production  
RUN CI=true SKIP_ENV_VALIDATION=true turbo run build --filter=@acme/nextjs...

FROM base AS runner
WORKDIR /app

EXPOSE 3000
ENV PORT 3000

ENV NODE_ENV production
ENV HOSTNAME localhost

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/apps/nextjs/next.config.mjs .
COPY --from=builder /app/apps/nextjs/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/nextjs/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/nextjs/.next/static ./apps/nextjs/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/nextjs/public ./apps/nextjs/public

CMD node apps/nextjs/server.js
