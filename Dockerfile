FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/homepage/package.json apps/homepage/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile

FROM dependencies AS homepage-build
COPY apps/homepage ./apps/homepage
RUN NITRO_PRESET=node-server pnpm --dir apps/homepage build

FROM node:24-bookworm-slim AS homepage
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080
COPY --from=homepage-build /app/apps/homepage/.output ./
USER node
EXPOSE 8080
CMD ["node", "server/index.mjs"]

FROM dependencies AS web-build
COPY apps/web ./apps/web
RUN pnpm --dir apps/web build

FROM web-build AS web
WORKDIR /app/apps/web
RUN chown -R node:node .next
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000
USER node
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start"]
