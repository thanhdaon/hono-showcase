FROM node:22.5.1-alpine3.19 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS builder
RUN apk add --no-cache gcompat
COPY . .
RUN pnpm install && pnpm build && pnpm prune --production

FROM base AS runner
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json
CMD ["node", "/app/dist/index.js"]