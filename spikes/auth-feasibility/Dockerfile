# Pinned official Node 24 image, inspected 2026-10-15. Build on the Mac, not the shared VPS.
FROM node:24-bookworm-slim@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5 AS build
WORKDIR /spike
COPY package.json package-lock.json .npmrc ./
RUN npm ci --ignore-scripts
COPY public ./public
COPY scripts/build.mjs ./scripts/build.mjs
RUN npm run build && npm prune --omit=dev --ignore-scripts

FROM node:24-bookworm-slim@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5
WORKDIR /spike
ENV NODE_ENV=production SPIKE_BIND=0.0.0.0 PORT=4317 SPIKE_DATA_DIR=/data NODE_OPTIONS=--max-old-space-size=160
COPY --from=build /spike/node_modules ./node_modules
COPY --from=build /spike/dist ./dist
COPY package.json ./*.mjs ./
COPY scripts/setup.mjs ./scripts/setup.mjs
USER node
EXPOSE 4317
CMD ["node", "server.mjs"]
