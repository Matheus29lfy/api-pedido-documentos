# Estágio 1: Build
FROM node:20-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./

# Instala todas as dependências (incluindo as de desenvolvimento para o build)
RUN npm install

# Copia o restante do código fonte
COPY . .

# Gera o build de produção do NestJS
# Isso vai mostrar o erro detalhado do compilador no console do Docker
RUN ./node_modules/.bin/nest build
# Estágio 2: Produção
FROM node:20-alpine AS runner

# Define o diretório de trabalho
WORKDIR /app

# Define a variável de ambiente para produção
ENV NODE_ENV=development

# Copia apenas os arquivos necessários do estágio de build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Instala apenas dependências de produção (ignora devDependencies)
RUN npm install --omit=dev

# Expõe a porta padrão da API (geralmente 3000 no NestJS)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "dist/main"]


