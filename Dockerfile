FROM node:18-bullseye

# instalar imagemagick e potrace (e dependências)
RUN apt-get update &&     apt-get install -y imagemagick potrace &&     rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# copiar package json e instalar deps
COPY package*.json ./
RUN npm install

# copiar todo codigo
COPY . .

# build frontend (Vite)
RUN npm run build

# expor porta
EXPOSE 3000

# start servidor (backend)
CMD ["node", "backend/server.js"]
