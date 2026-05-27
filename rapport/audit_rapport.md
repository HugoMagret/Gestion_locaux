# Audit du Rapport de Projet — `main.pdf`
**Projet :** Gestion des Locaux — M2 Informatique, Université d'Angers  
**Auteurs :** Firmin CAMUS, Antonin CHERRE, Hugo MAGRET, Clément OUSSET  
**Encadrants :** M. Jean-Michel RICHER, M. Vincent BARICHARD  
**Audit réalisé le :** 26 mai 2026

---

## Table des matières
1. [Ce qui est correct](#1-ce-qui-est-correct)
2. [Ce qui est faux ou obsolète](#2-ce-qui-est-faux-ou-obsolète)
3. [Ce qui manque complètement](#3-ce-qui-manque-complètement)
4. [Récapitulatif des corrections à effectuer](#4-récapitulatif-des-corrections-à-effectuer)

---

## 1. Ce qui est correct

### ✅ Page de garde (`00_page_de_garde.tex`)
- Noms des quatre auteurs corrects.
- Noms des encadrants corrects.
- Université, formation (M2 Informatique — Conception et Développement) et année universitaire (2025-2026) corrects.

### ✅ Introduction (`01_introduction.tex`)
- Le contexte général (recensement du personnel et du matériel du département informatique) est cohérent avec l'application livrée.
- Les objectifs listés (plans interactifs, gestion de l'inventaire, authentification, export PDF) correspondent bien aux fonctionnalités réellement implémentées.

### ✅ Architecture et Choix Techniques (`03_architecture.tex`)
- **Angular** : Justification correcte (expertise équipe, standard industrie, TypeScript, SPA).
- **Three.js** : La description du rendu 3D procédural, des `OrbitControls` et du **Raycasting** est exacte et correspond au code du composant `Map3dComponent`.
- **Node.js** : Justification correcte.
- **PostgreSQL** : Justification correcte (écritures simultanées, SGBDR robuste, rejet de SQLite).
- **Docker / docker-compose** : Description exacte (3 conteneurs : DB, backend, frontend ; lancement en une seule commande).
- **GitHub** : Workflow branches / issues / pull requests correctement décrit.
- **Structure du dépôt** : L'arborescence `back/`, `front/`, `database/`, `rapport/`, `docker-compose.yml` est exacte.

### ✅ Base de Données (`04_database.tex`)
- Toutes les tables sont présentes et correctement décrites : `room`, `staff`, `equipment`, `socket`, `door`, `user`, `room_type`, `equipment_type`, `socket_type`.
- L'utilisation des **UUID** comme clés primaires est correcte.
- Le stockage des coordonnées en **JSONB** est exact.
- Les règles d'intégrité **CASCADE / SET NULL** sont correctement mentionnées.

### ✅ Conception Logicielle (`05_logiciel.tex`)
- La séparation **Modèles / Services / Composants** est correctement décrite.
- L'utilisation de **RxJS** et des `BehaviorSubject` comme source de vérité unique est exacte (notamment pour `RoomService`).
- Le hashage des mots de passe avec **scrypt** (`back/config/auth.js`) est correct.

---

## 2. Ce qui est faux ou obsolète

### ❌ Schéma DB (`img/schema_db.mmd`) — Champ `color` manquant sur `ROOM_TYPE`

**Fichier concerné :** `rapport/img/schema_db.mmd` (ligne 25-28)

```
ROOM_TYPE {
    UUID id PK
    VARCHAR label
    ❌ MANQUE : VARCHAR color
}
```

**Réalité :** La table `room_type` possède bien un champ `color` en base de données (visible dans `database/01_init.sql` et dans le schéma Prisma). Ce champ est utilisé par le frontend pour coloriser les salles sur la carte interactive et dans la liste des salles. Son absence dans le diagramme est une erreur factuelle.

**Correction :** Ajouter `VARCHAR color` dans le bloc `ROOM_TYPE` du fichier `.mmd` et mentionner ce champ dans `04_database.tex`.

---

### ❌ Schéma DB — Table `DOOR` non reliée dans le diagramme ER

**Fichier concerné :** `rapport/img/schema_db.mmd`

La table `DOOR` est déclarée dans le schéma ER, mais **aucune relation n'est tracée** depuis ou vers elle. Elle apparaît comme une entité isolée, ce qui est trompeur. Dans l'application, les portes sont liées au concept d'étage (`floor` INTEGER) et sont gérées via le service `DoorService` et la route `/api/doors`.

**Correction :** Ajouter un commentaire ou une note dans le diagramme ER précisant que `DOOR.floor` est une clé de regroupement par étage (pas une FK vers une table `floor` inexistante, mais une valeur entière de référence).

---

### ❌ Diagramme UML (`img/diagramme_classes_uml.mmd`) — Composants Angular manquants

**Fichier concerné :** `rapport/img/diagramme_classes_uml.mmd`

Le diagramme ne montre que **4 composants** :
- `LoginComponent`
- `ProfileComponent`
- `RoomListComponent`
- `RoomDetailComponent`

Or l'application en compte **bien plus** :

| Composant manquant | Rôle |
|---|---|
| `MapComponent` | Vue 2D interactive des plans d'étage (SVG) |
| `Map3dComponent` | Vue 3D Three.js avec raycasting |
| `FloorManagerComponent` | Import JSON d'étages, export PDF, suppression d'étages |
| `RoomTypeManagerComponent` | CRUD des types de salles |
| `EquipmentManagerComponent` | CRUD de l'inventaire matériel |
| `StaffManagerComponent` | CRUD du personnel |
| `SocketManagerComponent` | CRUD des prises et connectiques |
| `UserManagerComponent` | CRUD des comptes utilisateurs (admin) |
| `AlertComponent` | Système de notifications toast globales |

**Correction :** Mettre à jour `diagramme_classes_uml.mmd` pour inclure ces composants.

---

### ❌ Diagramme UML — Services Angular manquants

Les services suivants existent dans le code (`front/src/app/services/`) mais sont **absents du diagramme** :

| Service manquant | Rôle |
|---|---|
| `FloorService` | Gestion des étages, import transactionnel JSON, liste des étages |
| `EquipmentService` | CRUD matériel (BehaviorSubject) |
| `StaffService` | CRUD personnel (BehaviorSubject) |
| `SocketService` | CRUD prises (BehaviorSubject) |
| `DoorService` | Récupération des portes par étage |

---

### ❌ Section `05_logiciel.tex` — `FloorService` non décrit

Le rapport mentionne que `RoomService` et `FloorService` utilisent un `BehaviorSubject`, mais `FloorService` n'est **jamais décrit** dans le document. Or, c'est un service central : il orchestre l'**import transactionnel des étages** (requête `POST /api/floors/import` utilisant `prisma.$transaction()` pour garantir l'atomicité de l'opération).

---

### ⚠️ Section `01_introduction.tex` — Vue 3D citée mais jamais détaillée

La vue 3D est mentionnée dans les objectifs :
> *"Un plan 3D complète cette vue, offrant une perspective supplémentaire des espaces."*

Et décrite succinctement dans `03_architecture.tex` (Three.js, Raycasting, OrbitControls). Cependant, **aucune section de visualisation** ne lui est dédiée dans le chapitre 2, contrairement à la vue 2D et à l'export PDF. Cela crée un déséquilibre dans la présentation.

---

## 3. Ce qui manque complètement

### 🔴 Mention de Prisma ORM

**Fichier concerné :** `03_architecture.tex`

Prisma est l'ORM utilisé par le backend pour toutes les interactions avec PostgreSQL. C'est un choix technique majeur (génération automatique du client typé, migrations, pattern singleton de connexion, etc.) qui n'est **nulle part mentionné** dans le rapport. La section backend décrit Node.js mais n'explique pas comment le backend dialogue avec la base de données.

**À ajouter :** Une sous-section dans `03_architecture.tex` décrivant Prisma, son rôle d'ORM, la gestion des transactions (`$transaction`) et le pattern singleton (`back/config/prisma.js`).

---

### 🔴 Description de l'import JSON des étages

**Fichier concerné :** `02_visualisation.tex` ou `05_logiciel.tex`

Le rapport décrit l'utilisation du format JSON pour les plans, mais ne détaille **jamais le système d'import** :
- Le format exact attendu (`level`, `rooms[]`, `doors[]`).
- La résolution automatique des types de salles (création à la volée si le type n'existe pas en base).
- La garantie d'**atomicité transactionnelle** (`prisma.$transaction`) qui assure qu'un import partiel ne corrompt pas la base de données.

---

### 🔴 Description du système de notifications toast

**Fichier concerné :** `05_logiciel.tex`

Le `NotificationService` et le composant `AlertComponent` constituent le système de feedback utilisateur (toasts de succès/erreur). Ce mécanisme transversal, utilisé par tous les composants, n'est **pas mentionné** dans le rapport.

---

### 🔴 Section dédiée à la vue 3D

**Fichier concerné :** `02_visualisation.tex`

La vue 3D mériterait une sous-section dans le chapitre Visualisation pour expliquer :
- Le rendu procédural des volumes à partir des coordonnées JSON 2D.
- L'utilisation de `THREE.BoxGeometry` pour les murs.
- Le système de sélection par **Raycasting**.
- La navigation via **OrbitControls**.

---

### 🟡 Mention du système d'authentification JWT

**Fichier concerné :** `05_logiciel.tex`

Le rapport parle de hashage des mots de passe (scrypt) mais ne mentionne pas :
- L'émission d'un **token JWT** signé lors de la connexion.
- Le stockage du token dans le `localStorage` sous la clé `auth_token`.
- L'**intercepteur HTTP Angular** (`auth.interceptor.ts`) qui injecte automatiquement le header `Authorization: Bearer <token>` sur toutes les requêtes sortantes.
- La distinction middleware `verifyToken` (utilisateurs connectés) vs `verifyAdmin` (administrateurs uniquement).

---

## 4. Récapitulatif des corrections à effectuer

### Fichiers `.mmd` à corriger

| Fichier | Correction |
|---|---|
| `img/schema_db.mmd` | Ajouter `VARCHAR color` dans `ROOM_TYPE` |
| `img/schema_db.mmd` | Clarifier la relation de `DOOR` avec l'étage |
| `img/diagramme_classes_uml.mmd` | Ajouter les 9 composants manquants |
| `img/diagramme_classes_uml.mmd` | Ajouter les 5 services manquants |

### Fichiers `.tex` à corriger ou compléter

| Fichier | Action |
|---|---|
| `04_database.tex` | Mentionner le champ `color` de `room_type` |
| `03_architecture.tex` | Ajouter une sous-section **Prisma ORM** |
| `03_architecture.tex` | Mentionner le middleware d'authentification JWT (intercepteur Angular) |
| `02_visualisation.tex` | Ajouter une sous-section dédiée à la **vue 3D** |
| `02_visualisation.tex` | Ajouter une sous-section sur l'**import JSON** des étages |
| `05_logiciel.tex` | Décrire `FloorService` et la transaction atomique |
| `05_logiciel.tex` | Décrire le `NotificationService` / `AlertComponent` |
| `05_logiciel.tex` | Compléter la section sécurité avec JWT (tokens, intercepteur, rôles) |

---

> **Note :** Toutes les vérifications ont été effectuées en croisant le code source réel du projet (`back/`, `front/src/app/`) avec le contenu des fichiers `.tex` et `.mmd` du dossier `rapport/`. Les sections jugées "correctes" ont été validées par comparaison directe avec le code en production (conteneurs Docker actifs).
