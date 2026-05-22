FROM node:20-slim

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/smdp-mockv2/package.json ./apps/smdp-mockv2/
COPY tsconfig.json ./

# Instalar pnpm
RUN npm install -g pnpm

# Instalar dependencias para node-gyp (requerido por pkcs11js)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Instalar dependencias
RUN pnpm install --filter @unuko/smdp-mockv2

# Copiar código fuente
COPY apps/smdp-mockv2 ./apps/smdp-mockv2

# Construir
RUN pnpm --filter @unuko/smdp-mockv2 build

EXPOSE 8080

CMD ["pnpm", "--filter", "@unuko/smdp-mockv2", "start"]
