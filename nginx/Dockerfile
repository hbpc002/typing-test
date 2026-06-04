FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build-only

FROM nginx:stable-alpine
RUN mkdir -p /etc/nginx/ssl
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY generate-cert.sh /docker-entrypoint.d/generate-cert.sh
RUN chmod +x /docker-entrypoint.d/generate-cert.sh
