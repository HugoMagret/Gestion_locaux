# Comment lancer l'environnement ?

## Construction et démarrage

Lancez successivement les commandes :
```bash
docker-compose build
docker-compose up
```

Cela lancera automatiquement l'ensemble de l'application avec les services suivants :

## Services et accès

| Service | Port | URL |
|---------|------|-----|
| **Frontend Angular** (Web App) | 4200 | http://localhost:4200 |
| **Backend Node.js** (API REST) | 3000 | http://localhost:3000 |
| **PostgreSQL** (Base de données) | 5432 | localhost:5432 |
| **PgAdmin** (Gestion DB) | 5050 | http://localhost:5050 |

### Accès à la Web App
Ouvrez votre navigateur et accédez à : **http://localhost:4200**

### Gestion de la base de données
PgAdmin est disponible à : **http://localhost:5050**
- Email : `admin@admin.com`
- Mot de passe : `admin`
