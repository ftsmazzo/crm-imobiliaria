FROM node:20-alpine AS builder

WORKDIR /app

# Build context no EasyPanel = raiz do repo
COPY site-imoveis/package*.json ./
RUN npm install

COPY site-imoveis/ .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

CMD ["npx", "next", "start"]
