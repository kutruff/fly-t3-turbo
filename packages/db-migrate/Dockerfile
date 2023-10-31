FROM node:20-alpine AS base
# LABEL fly_launch_runtime="Node.js"
ENV NEXT_TELEMETRY_DISABLED=1
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine 
RUN apk add --no-cache libc6-compat bash \
    && npm install -g pnpm

FROM base AS with-turbo
RUN npm install -g turbo

FROM with-turbo AS pruned-repo
WORKDIR /app
COPY . .
RUN turbo prune --scope=@acme/db --scope=@acme/db-migrate --docker

FROM with-turbo as builder
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=pruned-repo /app/out/json/ .
COPY --from=pruned-repo /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Build the project and its dependencies
COPY --from=pruned-repo /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm build

WORKDIR /app/packages/db-migrate
RUN pnpm pack 

FROM base as db-migrate
WORKDIR /db-migrate

COPY --from=builder /app/packages/db-migrate/*.tgz .
RUN pnpm i ./*.tgz

CMD CI=true pnpm exec db-migrate
