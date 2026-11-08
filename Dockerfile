FROM node:20-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --production

COPY --from=builder /app/dist ./dist

RUN apt-get purge -y python3 make g++ && apt-get autoremove -y

USER node
CMD ["node", "dist/index.js"]