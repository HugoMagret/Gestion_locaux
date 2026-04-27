FROM node:22-alpine

WORKDIR /app

# On installe l'Angular CLI globalement
RUN npm install -g @angular/cli

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4200

# Forcer Angular à écouter sur toutes les interfaces réseau dans Docker
CMD ["ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]