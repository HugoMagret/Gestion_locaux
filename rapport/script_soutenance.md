# Script Oral de Soutenance — Base de Données & Backend
**Projet :** Gestion des Locaux — M2 Informatique, Université d'Angers  
**Durée estimée de cette partie :** ~5 minutes  

---

> [!NOTE]
> **Conseil de posture** : Parlez calmement, de manière posée. Utilisez vos mains pour désigner les éléments de vos schémas sur le diapo. Ce script est rédigé dans un style fluide, professionnel et convaincant.

---

## 🎙️ DIAPO 1 : L'Architecture 3-Tiers
**⏱️ Timing indicatif :** 1 minute 15  
**🖼️ Visuel affiché :** *Schéma de l'architecture 3-tiers (Angular ↔️ Express ↔️ PostgreSQL)*  

### 🗣️ Le Script :
> « Bonjour à tous. Pour notre application de gestion des locaux de la faculté, notre principal défi technique était de concevoir un système hautement disponible, sécurisé et capable de maintenir une cohérence absolue de nos données.
> 
> Pour y parvenir, nous avons conçu une architecture découplée en **trois tiers** :
> 
> * Le premier tiers, c'est l'**interface de présentation**, propulsée par Angular sous la forme d'une Single Page Application réactive.
> * Le deuxième tiers, c'est notre **logique métier**, incarnée par une API REST robuste codée sous **Node.js** avec le framework **Express**.
> * Enfin, le troisième tiers est notre **base de données relationnelle** PostgreSQL.
> 
> Le choix du couple **Node.js et Express** pour notre backend est un choix d'ingénierie fort, motivé par trois raisons majeures :
> 
> 1. **Le modèle d'E/S non-bloquant de Node.js** : Contrairement aux serveurs multi-threads traditionnels (comme Java Spring Boot ou PHP) où chaque utilisateur connecté consomme un thread entier en bloquant la mémoire pendant les requêtes réseau ou base de données, Node.js fonctionne sur un modèle à **thread unique basé sur une boucle d'événements (Event Loop)**. Cela lui permet de gérer de manière asynchrone des milliers de requêtes concurrentes ultra-légères. C'est idéal pour notre application qui doit charger en parallèle de multiples éléments géométriques, équipements et prises sans aucun goulot d'étranglement.
> 2. **L'architecture par Middlewares d'Express** : Express est un framework minimaliste qui structure le pipeline de traitement des requêtes HTTP de façon extrêmement modulaire. Grâce aux **middlewares**, nous avons pu insérer de manière fluide et transparente nos verrous de sécurité JWT, notre validation de schéma Zod, et nos gestionnaires d'erreurs globaux.
> 3. **L'isomorphisme et l'unification du langage** : Utiliser JavaScript/TypeScript du client au serveur unifie la stack technique. Cela nous a permis de partager des interfaces et modèles de données communs entre le frontend Angular et le backend Express, accélérant le développement et supprimant les risques d'incompatibilité de types.
> 
> Ce découplage complet par API REST présente également un avantage d'évolutivité : si demain nous devions développer une application mobile native, nous aurions simplement à la brancher sur ces mêmes routes d'API, sans modifier une seule ligne de notre logique serveur. »

**🔄 Transition :**  
> « Maintenant que l'architecture physique et nos choix technologiques serveurs sont posés, penchons-nous sur la modélisation de nos données au sein du troisième tiers. »

---

## 🎙️ DIAPO 2 : La Modélisation PostgreSQL & L'Intégrité
**⏱️ Timing indicatif :** 1 minute  
**🖼️ Visuel affiché :** *Schéma de la base de données (Tables, UUID, Relations, et type JSONB)*  

### 🗣️ Le Script :
> « Pour le stockage de nos données, nous avons rejeté les bases de données embarquées comme SQLite pour implémenter un véritable serveur **PostgreSQL**. Nous avons orienté notre modélisation autour de trois principes d'ingénierie fondamentaux :
> 
> * Premièrement, **la sécurité et l'indépendance de nos données avec les UUID v4**. Toutes nos clés primaires sont des UUIDs. Cela empêche l'exposition d'IDs incrémentaux prédictibles dans nos URLs, éliminant ainsi toute tentative de siphonnage de la base. De plus, cela nous permet de générer des identifiants uniques directement côté client lors de l'import de plans complexes, sans aucun risque de collision en base.
> * Deuxièmement, **la rigueur des relations**. Nous avons configuré des contraintes d'intégrité strictes. Par exemple, si une salle est supprimée, la règle 'ON DELETE SET NULL' s'applique automatiquement sur le personnel et le matériel associé : ils ne sont pas supprimés, mais simplement désaffectés.
> * Troisièmement, **la flexibilité de PostgreSQL avec le type natif JSONB**. Pour tracer les polygones complexes de nos salles et localiser nos portes en 2D et en 3D, nous stockons directement leurs listes de coordonnées dans des champs JSONB indexés. Cela nous évite l'utilisation d'une extension lourde comme PostGIS tout en conservant des temps de réponse extrêmement bas lors des requêtes spatiales. »

**🔄 Transition :**  
> « Une bonne modélisation n'est rien sans un dialogue fluide et sécurisé entre notre serveur Express et notre base de données. C'est le rôle de notre ORM. »

---

## 🎙️ DIAPO 3 : Prisma ORM & Transactions
**⏱️ Timing indicatif :** 1 minute  
**🖼️ Visuel affiché :** *Image comparative "VULNERABLE (Raw SQL)" vs "SECURE & TYPED (Prisma ORM)"*  

### 🗣️ Le Script :
> « Pour faire dialoguer notre API Express et PostgreSQL, nous avons banni l'écriture de requêtes SQL brutes à la main. Nous avons choisi d'utiliser **Prisma ORM**.
> 
> La première raison est **la sécurité**. Les requêtes SQL construites par concaténation de chaînes de caractères sont les cibles parfaites pour les **injections SQL**, une faille critique majeure. Prisma résout ce problème à la racine en paramétrant automatiquement toutes ses requêtes SQL, rendant toute tentative d'injection impossible.
> 
> La deuxième raison, c'est **la robustesse opérationnelle grâce aux transactions SQL (`$transaction`)**. Dans notre application, un administrateur peut importer un étage entier sous forme de fichier JSON. Cette action déclenche des dizaines d'insertions simultanées de salles, de portes, d'équipements et de prises. 
> 
> Grâce au mécanisme d'**atomicité** des transactions Prisma, soit l'intégralité du fichier est insérée avec succès en base de données, soit tout est instantanément annulé par un Rollback au moindre avertissement ou champ invalide. La base de données ne se retrouve donc jamais à moitié importée ou corrompue. »

**🔄 Transition :**  
> « La robustesse de nos requêtes est maintenant assurée. Voyons à présent comment nous contrôlons qui a le droit d'effectuer ces requêtes. »

---

## 🎙️ DIAPO 4 : Sécurité & Authentification JWT
**⏱️ Timing indicatif :** 1 minute  
**🖼️ Visuel affiché :** *Diagramme du flux d'authentification JWT et des middlewares*  

### 🗣️ Le Script :
> « Notre architecture de sécurité repose sur des jetons **JWT (JSON Web Token)** pour une authentification moderne et **stateless**.
> 
> Lorsqu'un utilisateur se connecte, son mot de passe est comparé de manière cryptographique grâce à l'algorithme de dérivation de clé hautement sécurisé **scrypt**, qui résiste aux attaques par force brute grâce à son coût élevé en mémoire. Une fois authentifié, le serveur signe un jeton JWT contenant ses privilèges, valide pendant 24 heures.
> 
> Pour sécuriser l'accès à nos routes API Express, nous avons développé deux middlewares dédiés :
> 
> * Le premier, `verifyToken`, vérifie simplement la validité de la signature cryptographique du jeton. Il est requis pour toutes les opérations standards, comme consulter les plans ou éditer son propre profil.
> * Le second, `verifyAdmin`, applique de manière rigoureuse le **principe du moindre privilège**. Il inspecte le rôle dans le token et s'assure que seul un utilisateur ayant le drapeau `is_admin` à vrai peut accéder aux fonctionnalités d'écriture de l'infrastructure – comme la création de salles, l'affectation du personnel ou l'import d'étages. »

**🔄 Transition :**  
> « Enfin, pour parfaire cette sécurité, nous devons nous assurer que les données soumises au serveur respectent scrupuleusement la structure attendue. »

---

## 🎙️ DIAPO 5 : Validation Zod & Résilience
**⏱️ Timing indicatif :** 1 minute  
**🖼️ Visuel affiché :** *Diagramme du flux de validation Zod et intercepteur Angular*  

### 🗣️ Le Script :
> « Le dernier rempart de notre backend est notre système de validation de schéma avec **Zod**. 
> 
> En ingénierie de sécurité, la règle d'or est de ne jamais faire confiance aux données envoyées par l'utilisateur. Zod agit comme un pare-feu applicatif : chaque requête entrante de modification est validée selon un schéma de données strict. Si un e-mail est mal formaté ou si des coordonnées géométriques sont invalides, la requête est immédiatement rejetée avec un code de retour HTTP `400 Bad Request`.
> 
> De plus, nous avons harmonisé ce comportement avec le frontend Angular grâce à un **intercepteur HTTP global**. Si le token JWT de l'utilisateur expire, la requête suivante renvoie un code `401 Unauthorized` du serveur. L'intercepteur intercepte cette erreur en tâche de fond, nettoie proprement la session dans le cache du navigateur et redirige l'utilisateur vers l'écran de connexion avec une notification claire.
> 
> Cette résilience globale assure à la fois une sécurité sans compromis côté backend, et une expérience utilisateur sans friction côté frontend. 
> 
> Je vous remercie pour votre attention, et nous sommes désormais ouverts à vos questions. »
