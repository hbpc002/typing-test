FROM node:18-alpine AS builder
RUN apk add --no-cache python3 make g++ openssl
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
RUN mkdir -p /data
EXPOSE 8000
CMD ["./node_modules/.bin/ts-node", "src/index.ts"]
