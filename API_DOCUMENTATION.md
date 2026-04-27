# Guide d'Utilisation : Backend & Base de Données

Ce document est destiné à l'équipe **Frontend** pour comprendre comment interagir avec le Backend et la Base de Données du projet de Gestion de Locaux.

---

## 1. Accès au Backend

Le backend tourne sous Node.js (Express) et est accessible à l'adresse suivante une fois le Docker lancé :
**URL de base** : `http://localhost:3000/api`

---

## 2. Guide des API (Endpoints)

### 2.1 Les Salles (Rooms)
Permet de récupérer la liste complète des salles avec leurs équipements, personnel et prises rattachés.

- **GET `/api/rooms`** : Récupère toutes les salles.
  - **Filtres optionnels** (Query Params) :
    - `floor=number` : Filtrer par étage.
    - `min_doors=number` : Minimum de portes.
    - `min_capacity=number` : Capacité minimum.
    - `type=uuid` : Filtrer par type de salle.
    - `min_sockets=number` : Nombre de prises minimum.
  - *Exemple* : `/api/rooms?floor=1&min_doors=2`
- **POST `/api/rooms`** : Crée une nouvelle salle.
  - *Body requis* : `{ name: string, max_capacity: number, room_type_id: uuid, doors: number, coordinates: object, floor: number, color: string }`
- **DELETE `/api/rooms/:id`** : Supprime une salle par son ID.

**Format d'une salle (JSON) :**
```json
{
  "id": "uuid",
  "name": "B102",
  "max_capacity": 30,
  "room_type_id": "uuid",
  "doors": 2,
  "floor": 1,
  "color": "#3498db",
  "coordinates": { "x": 10, "y": 20, "width": 100, "height": 100 },
  "staff": [...],      // Liste des membres du personnel dans cette salle
  "equipments": [...], // Liste du matériel présent
  "sockets": [...]     // Liste des prises
}
```

### 2.2 Ajouter du contenu à une salle (Setters)
Ces routes permettent d'ajouter du contenu directement en connaissant l'ID de la salle.
- **POST `/api/rooms/:id/staff`** : Ajoute un membre du personnel dans cette salle.
  - *Body requis* : `{ first_name: string, last_name: string }`
- **POST `/api/rooms/:id/equipment`** : Ajoute un équipement dans cette salle.
  - *Body requis* : `{ name: string, serial_number: string, equipment_type_id: uuid }`

### 2.3 Le Personnel (Staff)
- **GET `/api/staff`** : Liste tout le personnel.
- **POST `/api/staff`** : Ajoute un membre.
  - *Body requis* : `{ first_name: string, last_name: string, room_id: uuid|null }`

### 2.3 Types (Dictionnaires)
Utile pour remplir les menus déroulants (Select) dans les formulaires.
- **GET `/api/types/room`** : Liste les types de salles (Bureau, Salle de cours...).
- **GET `/api/types/equipment`** : Liste les types d'équipements (Vidéoprojecteur...).

---

## 3. Exemple d'intégration Angular

Voici un exemple type de service Angular (`room.service.ts`) pour consommer notre API :

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private apiUrl = 'http://localhost:3000/api/rooms';

  constructor(private http: HttpClient) {}

  // Récupérer toutes les salles
  getRooms(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Ajouter une salle
  addRoom(roomData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, roomData);
  }

  // Supprimer une salle
  deleteRoom(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

---

## 4. Structure de la Base de Données

Si vous avez besoin de connaître les noms exacts des colonnes, voici l'organisation :

1.  **Room** : `id`, `name`, `max_capacity`, `room_type_id`, `doors`, `coordinates`.
2.  **Staff** : `id`, `first_name`, `last_name`, `room_id`.
3.  **Equipment** : `id`, `name`, `serial_number`, `equipment_type_id`, `room_id`.
4.  **Socket** : `id`, `identifier`, `socket_type_id`, `room_id`.
5.  **Room_type**, **Equipment_type**, **Socket_type** : `id`, `label`.

---

## 5. Comment lancer l'environnement ?

L'équipe Frontend n'a qu'une seule commande à retenir pour avoir tout l'environnement local (DB + Back) prêt :
```bash
docker compose up -d
```
Cela lancera automatiquement :
- PostgreSQL sur le port `5432`.
- Le Backend sur le port `3000`.
