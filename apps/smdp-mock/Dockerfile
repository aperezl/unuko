FROM node:20-slim

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/smdp-mock/package.json ./apps/smdp-mock/
COPY tsconfig.json ./

# Instalar pnpm
RUN npm install -g pnpm

# Instalar dependencias
RUN pnpm install --filter @unuko/smdp-mock

# Copiar código fuente
COPY apps/smdp-mock ./apps/smdp-mock

# Construir
RUN pnpm --filter @unuko/smdp-mock build

EXPOSE 8080

CMD ["pnpm", "--filter", "@unuko/smdp-mock", "start"]
