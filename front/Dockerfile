FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install -g @angular/cli
RUN npm install

COPY . .

EXPOSE 4200

# Forcer Angular à écouter sur toutes les interfaces réseau dans Docker
CMD ["ng", "serve", "--host", "0.0.0.0"]