FROM node:18-alpine
RUN apk add --no-cache python3 make g++ openssl
WORKDIR /app
COPY package.json ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN mkdir -p /data
EXPOSE 8000
CMD ["pnpm", "start"]
