# Documentation : Base de Données - Gestion de Locaux

Ce document explique l'architecture et le fonctionnement de la base de données PostgreSQL utilisée pour le projet de gestion de salles de faculté.

## 1. Architecture Générale

La base de données est composée de **7 tables** interconnectées permettant de suivre l'occupation des salles par le personnel ainsi que l'inventaire du matériel et des prises disponibles.

### Schéma Relationnel (Mermaid)

```mermaid
erDiagram
    room_type ||--o{ room : "catégorise"
    room ||--o{ staff : "accueille"
    room ||--o{ equipment : "contient"
    room ||--o{ socket : "possède"
    equipment_type ||--o{ equipment : "définit"
    socket_type ||--o{ socket : "classifie"

    room {
        uuid id PK
        string name "Nom de la salle (ex: B102)"
        int max_capacity "Capacité maximale"
        uuid room_type_id FK
    }

    room_type {
        uuid id PK
        string label "Bureau, Salle de cours, etc."
    }

    staff {
        uuid id PK
        string last_name
        string first_name
        uuid room_id FK "Localisation actuelle (optionnel)"
    }

    equipment {
        uuid id PK
        string name
        string serial_number
        uuid equipment_type_id FK
        uuid room_id FK
    }

    equipment_type {
        uuid id PK
        string label "Tableau, Vidéoprojecteur, etc."
    }

    socket {
        uuid id PK
        string identifier "Nom/Numéro de la prise"
        uuid socket_type_id FK
        uuid room_id FK
    }

    socket_type {
        uuid id PK
        string label "Réseau, Électrique, etc."
    }
```

## 2. Choix Techniques

### Identifiants UUID
Contrairement aux identifiants classiques (1, 2, 3...), nous utilisons des **UUID (Universally Unique Identifiers)**. 
- **Pourquoi ?** Ils permettent de fusionner des bases de données plus facilement à l'avenir et cachent la quantité réelle de données stockées pour plus de sécurité.
- **Mise en œuvre** : L'extension Postgres `uuid-ossp` génère ces clés automatiquement.

### PostgreSQL & Docker
La base tourne sous **PostgreSQL 15** dans un conteneur Docker. Cela garantit que le projet fonctionne exactement de la même manière sur Windows (via Docker Desktop) et sur Linux.

## 3. Guide d'Utilisation Docker

### Lancement
Pour démarrer la base de données :
```bash
docker compose up -d
```

### Arrêt
Pour arrêter les services :
```bash
docker compose stop
```

## 4. Informations de Connexion

Si vous souhaitez connecter une application ou un outil (comme DBeaver) :

| Paramètre | Valeur |
| :--- | :--- |
| **Hôte** | `localhost` |
| **Port** | `5432` |
| **Utilisateur** | `admin` |
| **Mot de passe** | `password123` |
| **Base de données**| `gestion_locaux` |

## 5. Persistence des Données
Les données sont stockées dans un **volume Docker** nommé `pgdata`. Cela signifie que même si vous supprimez le conteneur, vos salles et votre personnel ne seront pas supprimés. Ils sont sauvegardés dans un dossier sécurisé géré par Docker sur votre disque dur.

## 6. Initialisation
Le script [init.sql](./init.sql) est exécuté **uniquement lors de la toute première création** de la base de données. Il contient la structure des tables et quelques données de base pour démarrer le projet.
