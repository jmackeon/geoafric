FROM node:20-alpine AS builder
WORKDIR /repo

COPY package.json package-lock.json turbo.json ./
COPY apps/api ./apps/api
COPY packages ./packages

RUN npm ci
RUN npx turbo run build --filter=api

FROM node:20-alpine AS runner
WORKDIR /repo

ENV NODE_ENV=production

COPY --from=builder /repo/package.json /repo/package-lock.json ./
COPY --from=builder /repo/apps/api/dist ./apps/api/dist
COPY --from=builder /repo/apps/api/package.json ./apps/api/package.json
COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/packages ./packages

EXPOSE 3000

CMD ["node", "apps/api/dist/main"]
