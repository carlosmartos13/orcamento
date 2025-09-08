FROM node:18-alpine

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Servir arquivos estáticos
EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
