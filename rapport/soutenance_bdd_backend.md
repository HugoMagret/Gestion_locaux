# Guide de Soutenance — Base de Données & Backend
**Projet :** Gestion des Locaux — M2 Informatique, Université d'Angers  
**Support préparé pour la présentation orale**  

---

> [!TIP]
> **Conseil pour l'oral** : Le jury (M. RICHER & M. BARICHARD) apprécie les choix techniques motivés par des contraintes réelles (performance, sécurité, intégrité) plutôt que par "effet de mode". Ce guide insiste particulièrement sur le **pourquoi** de chaque choix.

---

## 🖥️ Plan des Diapositives (Le Diapo)

### 📊 Diapo 1 : Introduction & Architecture Générale
* **Titre** : Gestion des Locaux : Une Architecture Moderne & Robuste
* **Visuel suggéré** : Schéma d'architecture en 3 tiers (Frontend Angular ↔️ Backend Node/Express ↔️ SGBD PostgreSQL).
* **Points clés à afficher** :
  * Découplage complet (REST API).
  * Choix de **Node.js / Express** : Performance des E/S asynchrones, écosystème mature.
  * Choix de **PostgreSQL** : Robustesse relationnelle, gestion native des données géométriques.
  * Cohérence du langage : JavaScript/TypeScript du client au serveur.

---

### 🗄️ Diapo 2 : Modélisation de la Base de Données (Le Schéma ER)
* **Titre** : Modélisation Relationnelle & Intégrité des Données
* **Visuel suggéré** : Le diagramme ER (schéma des tables avec clés primaires/étrangères).
* **Points clés à afficher** :
  * **UUID v4 systématiques** : Clés primaires non prédictibles (sécurité) et importations sans collision.
  * **Intégrité référentielle stricte** : Utilisation rigoureuse de `ON DELETE CASCADE` (ex: suppression d'un type de salle) et `ON DELETE SET NULL` (ex: affectation du personnel).
  * **Flexibilité avec JSONB** : Stockage natif des coordonnées géométriques (polygones des salles, positions des portes).

---

### ⚡ Diapo 3 : Dialogue BDD ↔️ Backend : Le choix de Prisma ORM
* **Titre** : Accès aux Données & Sécurité avec Prisma ORM
* **Visuel suggéré** : Capture de code comparant une requête SQL brute vulnérable à une requête sécurisée/typée avec Prisma Client.
* **Points clés à afficher** :
  * **Génération automatique du client** : Typage TypeScript complet de la base de données.
  * **Sécurité par design** : Requêtes paramétrées natives (protection absolue contre les injections SQL).
  * **Transactions atomiques (`$transaction`)** : Essentiel pour l'import JSON d'étages entiers (tout est inséré avec succès, ou tout est annulé en cas d'erreur).

---

### 🔐 Diapo 4 : Sécurité & Contrôle d'Accès
* **Titre** : Sécurité Applicative & Architecture JWT (JSON Web Token)
* **Visuel suggéré** : Diagramme du flux d'authentification (Login ➡️ Génération JWT ➡️ Headers Authorization: Bearer ➡️ Middleware Express).
* **Points clés à afficher** :
  * **Authentification Stateless** : Émission d'un token JWT valide 24 heures.
  * **Double niveau de protection (Middlewares)** :
    * `verifyToken` : Authentification générique (ex: modification de son propre profil).
    * `verifyAdmin` : Enforcement strict des privilèges (ex: modification des plans, matériel, utilisateurs).
  * **Robustesse du hashage** : Mots de passe sécurisés avec **scrypt** (sel unique par utilisateur).

---

### 🔄 Diapo 5 : Fiabilité de l'API & Validation des Données
* **Titre** : Validation à l'entrée & Robustesse du Backend
* **Visuel suggéré** : Schéma montrant : Requête HTTP ➡️ Middleware de Validation (Zod) ➡️ Contrôleur Express ➡️ Base de données.
* **Points clés à afficher** :
  * **Validation par Schéma (Zod)** : Analyse et validation stricte du format des données entrantes (ex: structure des coordonnées JSON, unicité des labels).
  * **Architecture de feedback** : Code de retour HTTP appropriés (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`).
  * **Intercepteur d'erreurs global (Front)** : Déconnexion automatique et redirection vers `/login` en cas de token expiré ou altéré (`401`).

---

## 🗣️ Le Discours à l'Oral (Slide par Slide)

### 🎙️ Introduction (Diapo 1)
> *"Bonjour à tous. Pour notre application de gestion des locaux, notre priorité technique a été de construire un backend et une base de données capables de garantir deux choses fondamentales : **la cohérence absolue des données** et **une sécurité granulaire**. Nous avons fait le choix d'une architecture découplée avec une API REST sous **Node.js** et **Express**. Ce choix s'explique par la rapidité de développement, les performances de Node.js sur les opérations d'entrées/sorties asynchrones, et l'alignement technologique puisqu'il nous permet d'avoir du JavaScript/TypeScript sur l'ensemble de la stack, du frontend Angular jusqu'au serveur."*

---

### 🎙️ La Base de Données & Modélisation (Diapo 2)
> *"Pour le stockage, nous avons choisi **PostgreSQL**. Contrairement à des solutions plus légères comme SQLite, PostgreSQL est un SGBD industriel extrêmement robuste, capable de gérer des écritures concurrentes et offrant un support natif exceptionnel des types modernes. Nous avons structuré notre modèle relationnel autour de trois piliers :*
> * *Premièrement, l'**usage systématique des UUID v4** pour toutes nos clés primaires. Cela évite d'exposer des identifiants séquentiels prédictibles dans nos URLs, ce qui renforce la sécurité, et cela facilite les imports de fichiers JSON sans aucun risque de collision de clés.*
> * *Deuxièmement, **l'intégrité référentielle** : nous avons configuré avec soin les comportements à la suppression. Par exemple, si l'on supprime un type d'équipement, tous les équipements de ce type sont supprimés en cascade. En revanche, si l'on supprime une salle, le personnel qui y était affecté voit son champ 'room_id' passer à NULL, évitant ainsi toute perte de données.*
> * *Enfin, nous exploitons la puissance du **type JSONB** de PostgreSQL pour stocker les coordonnées géométriques complexes des salles et des portes. Cela nous évite d'avoir recours à une extension spatiale lourde comme PostGIS tout en conservant une flexibilité totale sur les tracés 2D."*

---

### 🎙️ Le choix de Prisma ORM (Diapo 3)
> *"Pour faire dialoguer notre serveur Express avec PostgreSQL, nous avons rejeté les requêtes SQL brutes manuelles pour utiliser **Prisma ORM**. Ce choix est motivé par la sécurité et la productivité :*
> * *Prisma génère un client entièrement typé à partir de notre schéma, ce qui élimine les erreurs de requête dès la phase de compilation.*
> * *Il protège nativement l'application contre les **injections SQL** en paramétrant automatiquement toutes les requêtes.*
> * *Mais surtout, Prisma nous permet d'utiliser le concept de **Transactions SQL (`$transaction`)**. C'est ce mécanisme qui orchestre notre fonctionnalité d'importation JSON d'étages entiers. Lorsqu'un administrateur importe un plan, des dizaines de salles, de portes, de prises et d'équipements doivent être insérés simultanément. Grâce aux transactions, si une seule insertion échoue (par exemple à cause d'une coordonnée invalide), la transaction entière est annulée en base de données. C'est l'assurance d'avoir une base de données toujours propre et jamais corrompue par des imports partiels."*

---

### 🎙️ La Sécurité & JWT (Diapo 4)
> *"La sécurité de notre API repose sur un mécanisme d'authentification **stateless par JWT (JSON Web Token)**. Lors de la connexion, le serveur valide les identifiants en comparant le mot de passe hashé avec l'algorithme sécurisé **scrypt**. Si la validation réussit, le serveur émet un token JWT signé contenant l'identité et le rôle de l'utilisateur. Ce token est valide pendant 24 heures.*
> * *Pour protéger nos routes Express, nous avons développé deux middlewares spécifiques : `verifyToken` pour s'assurer que l'utilisateur est authentifié, et `verifyAdmin` qui restreint l'accès aux seules fonctions d'administration.*
> * *Cette séparation stricte garantit qu'un utilisateur standard peut consulter les plans ou modifier son propre profil, mais qu'il lui est absolument impossible d'altérer l'inventaire, de modifier les plans des locaux, ou de manipuler les comptes utilisateurs."*

---

### 🎙️ Validation & Résilience (Diapo 5)
> *"Pour finir, un bon backend ne doit jamais faire confiance aux données envoyées par le client. C'est pourquoi nous avons intégré un système de **validation de schéma avec la bibliothèque Zod**. Chaque requête entrante qui modifie l'état du système passe par un validateur qui vérifie le type, le format et la présence de chaque champ.*
> * *En cas de données invalides, le backend intercepte l'erreur immédiatement et renvoie un code d'erreur HTTP explicite (comme `400 Bad Request` ou `403 Forbidden`).*
> * *Nous avons également bouclé la boucle côté frontend Angular en développant un **intercepteur HTTP global**. Si le serveur renvoie un code `401 Unauthorized` (par exemple si le token JWT stocké dans le navigateur a expiré), l'intercepteur le détecte, nettoie la session locale de l'utilisateur et le redirige proprement vers la page de login avec une notification toast. Cela garantit une expérience utilisateur fluide et sécurisée, sans blocages inexpliqués."*

---

## 🧠 Questions probables du jury & Comment y répondre

### ❓ Question 1 : "Pourquoi ne pas avoir utilisé SQLite pour ce projet universitaire ?"
* **Mauvaise réponse** : *"Parce que PostgreSQL est plus moderne."*
* **Bonne réponse** : *"SQLite est excellent pour des applications embarquées ou mono-utilisateur. Cependant, notre projet de gestion des locaux est conçu pour être utilisé simultanément par plusieurs administrateurs (secrétariat, équipe technique, enseignants). PostgreSQL gère nativement les verrous fins sur les lignes et les connexions simultanées sans bloquer la base de données. De plus, son support natif performant du type JSONB était indispensable pour stocker de manière flexible les géométries 2D complexes de nos plans."*

### ❓ Question 2 : "Vos tokens JWT sont valides 24h. Si un administrateur est révoqué, comment invalider son token immédiatement ?"
* **Réponse d'expert** : *"C'est la contrainte classique des tokens stateless. Dans une version future, nous pourrions implémenter une **liste noire de tokens (blacklist)** stockée dans un cache rapide en mémoire comme Redis. Lors de la déconnexion ou de la révocation d'un utilisateur, l'ID de son token est placé dans la blacklist avec une expiration égale à la durée de vie restante du token (maximum 24h). Notre middleware `verifyToken` interrogerait ce cache rapide avant de valider la requête."*

### ❓ Question 3 : "Comment garantissez-vous que le mot de passe stocké en base est incassable ?"
* **Bonne réponse** : *"Nous n'utilisons pas d'algorithmes de hashage obsolètes et rapides comme MD5 ou SHA-1, qui sont vulnérables aux attaques par dictionnaire et par tables arc-en-ciel. Nous utilisons **scrypt**, qui est un algorithme de dérivation de clé conçu pour être extrêmement coûteux en mémoire et en temps processeur, ce qui rend les attaques par force brute (sur GPU ou ASIC) quasiment impossibles. De plus, nous appliquons un **sel (salt)** unique généré aléatoirement pour chaque utilisateur avant le hashage, ce qui garantit que deux utilisateurs ayant le même mot de passe auront des empreintes totalement différentes en base de données."*
