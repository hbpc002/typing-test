FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --ignore-scripts && pnpm rebuild esbuild
COPY . .
RUN pnpm build-only

FROM nginx:stable-alpine
RUN mkdir -p /etc/nginx/ssl
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY generate-cert.sh /docker-entrypoint.d/generate-cert.sh
RUN chmod +x /docker-entrypoint.d/generate-cert.sh
