# Comment lancer l'environnement ?



## Construction et démarrage (mode détaché conseillé) :
```bash
docker-compose build
docker-compose up -d
```

## Arrêt et suppression des conteneurs (sans volumes) :
```bash
docker-compose down
```

## Un problème ?

Si vous rencontrez des problèmes (conteneurs bloqués, ports occupés, erreurs de montage), vous pouvez forcer la suppression des volumes associés :
```bash
docker-compose down -v
```

## Note dépannage

- Si la commande Docker renvoie une erreur de permission (connexion au socket Docker refusée), exécutez `sudo docker-compose ...` ou ajoutez votre utilisateur au groupe `docker` puis reconnectez-vous.
- Si `docker-compose up` semble ne pas appliquer des changements, pensez à reconstruire avec `docker-compose build --no-cache`.

## Services et accès

| Service | Port | URL |
|---------|------|-----|
| **Frontend Angular** (Web App) | 4200 | http://localhost:4200 |
| **Backend Node.js** (API REST) | 3000 | http://localhost:3000 |
| **PostgreSQL** (Base de données) | 5432 | localhost:5432 |
| **PgAdmin** (Gestion DB) | 5050 | http://localhost:5050 |

### Accès à la Web App

Ouvrez votre navigateur et accédez à : **http://localhost:4200**

Pour une première connexion, les **codes d'accès** sont :

- Identifiant : `admin`
- Mot de passe : `admin`

Une fois connecté, vous pouvez **changer ce mot de passe**, dans la section `Profil`.
Vous pouvez **créer des nouveaux accès utilisateurs** dans la section `Utilisateurs`.

### Gestion de la base de données
PgAdmin est disponible à : **http://localhost:5050**
- Email : `admin@admin.com`
- Mot de passe : `admin`
