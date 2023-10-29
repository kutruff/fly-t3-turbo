FROM node:18-alpine AS base
LABEL fly_launch_runtime="Node.js"
ENV NEXT_TELEMETRY_DISABLED=1
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine 
RUN apk add --no-cache libc6-compat

FROM base AS pruned-repo
WORKDIR /app

RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=@acme/db --docker

FROM base as db-migrator
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

CMD CI=true SKIP_ENV_VALIDATION=true pnpm db:migrate
