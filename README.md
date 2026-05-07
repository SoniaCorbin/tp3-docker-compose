# ☢ APOCALISTE — BUNKER EDITION

```text
╔═══════════════════════════════════════════════╗
║  TRANSMISSION CHIFFRÉE — BUNKER CONTROL ALPHA ║
║  PROTOCOLE : Apocaliste / Système de gestion  ║
║  STATUT    : EN OPÉRATION                     ║
╚═══════════════════════════════════════════════╝
```

**Tableau de bord de survie post-apocalyptique**
*Architecture multi-services Docker — TP3*

---

## 📡 BRIEFING

Bienvenue, Opérateur. Vous accédez à **Apocaliste**, le système de gestion centralisé du bunker.
Depuis l'impact, ce tableau de bord assure le suivi en temps réel des **trois piliers de la survie** :

| Module | Rôle dans le bunker | Collection |
|---|---|---|
| 📦 **BunkerStock** | Inventaire des ressources critiques (eau, nourriture, munitions, médical…) | `stocks` |
| 🛠 **BunkerOps** | Surveillance des zones (statut opérationnel, niveau de danger) | `zones` |
| 🧑‍🚀 **BunkerCrew** | Registre des survivants (rôle, état, compétences) | `crew` |

Un **Dashboard** central agrège ces données en un **indice global de survie** calculé en temps réel, accompagné d'un **compteur des jours écoulés depuis l'impact**.

---

## ⚙ ARCHITECTURE

```
              ┌────────────────────┐
              │   Navigateur       │
              └─────────┬──────────┘
                        │ :80
              ┌─────────▼──────────┐
              │   nginx (proxy)    │
              └────┬──────────┬────┘
                   │          │
          /        │          │ /api
                   │          │
        ┌──────────▼──┐   ┌───▼──────────┐
        │  Client     │   │  API Express │
        │  React+Vite │   │  Node.js     │
        └─────────────┘   └───┬──────────┘
                              │ :27017
                          ┌───▼──────────┐
                          │   MongoDB    │
                          └──────────────┘
```
_________________________________________________________________________________________________
| Service    | Stack                             | Port (dev) | Port (prod)                     |
|------------|-----------------------------------|:----------:|:-------------------------------:|
| `nginx`    | nginx 1.27 alpine                 | `80`       | `80`                            |
| `client`   | React 18 + Vite 5 + React Router  | `5173`     | _(servi en statique par nginx)_ |
| `api`      | Node.js 20 + Express + Mongoose   | `5000`     | _(interne)_                     |
| `database` | MongoDB 7                         | `27017`    | _(interne)_                     |
-------------------------------------------------------------------------------------------------
---

## 🚀 PROTOCOLE D'ACTIVATION — DÉVELOPPEMENT

```bash
docker compose up --build
```

Le bunker s'éveille. Quatre conteneurs entrent en service.

**Points d'accès** :

| URL                                   | Description                            |
|-------------------------------------- |----------------------------------------|
| 🛡 `http://localhost`                 | **Interface principale** (via nginx)   |
| ⚛ `http://localhost:5173`            | Client React direct (debug)            |
| 🔌 `http://localhost:5000/api/health`| Diagnostic de l'API                    |

Le **live reload** est actif : modifier un fichier dans `client/src` ou `api/` recharge automatiquement le service concerné.

**Pour mettre le bunker en veille** :

```bash
docker compose down
```

**Effacement total** *(efface aussi la base — utiliser avec précaution)* :

```bash
docker compose down -v
```

---

## 🏭 PROTOCOLE D'ACTIVATION — PRODUCTION

```bash
docker compose -f docker-compose.prod.yml up --build
```

Application accessible uniquement sur **http://localhost** (port 80).

**Différences clés avec le développement** :

- Le client React est **buildé** (`npm run build`) puis servi en statique par nginx
- Aucun bind mount du code source, aucun live reload
- La base de données et l'API ne sont **plus exposées publiquement** (réseau Docker interne uniquement)
- nginx est l'**unique point d'entrée**

---

## 🔧 VARIABLES D'ENVIRONNEMENT

Voir `.env.example` pour le détail.
______________________________________________________________________________________________________________
| Variable       | Service | Exemple                              | Description                              |
|----------------|---------|--------------------------------------|------------------------------------------|
| `PORT`         | api     | `5000`                               | Port d'écoute de l'API                   |
| `MONGO_URL`    | api     | `mongodb://database:27017/apocalist` | URL MongoDB (résolue via DNS Docker)     |
| `NODE_ENV`     | api     | `development` / `production`         | Mode d'exécution                         |
| `VITE_API_URL` | client  | `http://localhost:5000/api`          | URL API en dev (en prod : `/api` relatif)|
--------------------------------------------------------------------------------------------------------------

> 🔒 Le fichier `.env` n'est jamais commité (voir `.gitignore`). Seul `.env.example` est versionné.

---

## 🛣 ROUTES DE L'API

### Diagnostic

```
GET    /api/health                   → Vérification de l'état de l'API
```

### 📦 BunkerStock — `/api/stocks`

```
GET    /api/stocks                   → Liste toutes les ressources
GET    /api/stocks/:id               → Détail d'une ressource
POST   /api/stocks                   → Crée une ressource
PUT    /api/stocks/:id               → Modifie une ressource
DELETE /api/stocks/:id               → Supprime une ressource
```

**Champs** : `name`, `category`, `quantity`, `priority`, `survivalIndex` *(calculé)*

### 🛠 BunkerZone — `/api/zones`

```
GET    /api/zones                    → Liste toutes les zones
GET    /api/zones/:id                → Détail d'une zone
POST   /api/zones                    → Crée une zone
PUT    /api/zones/:id                → Modifie une zone
DELETE /api/zones/:id                → Supprime une zone
```

**Champs** : `name`, `status` *(operational / maintenance / critical)*, `dangerLevel` (0-10), `description`

### 🧑‍🚀 BunkerCrew — `/api/crew`

```
GET    /api/crew                     → Liste tous les survivants
GET    /api/crew/:id                 → Détail d'un survivant
POST   /api/crew                     → Enregistre un survivant
PUT    /api/crew/:id                 → Modifie un survivant
DELETE /api/crew/:id                 → Retire un survivant du registre
```

**Champs** : `name`, `role`, `skillLevel` (1-10), `state` *(ok / injured / missing)*, `survivalProbability` *(calculé)*

### Exemple de transmission

```bash
curl http://localhost/api/health

curl -X POST http://localhost/api/stocks \
  -H "Content-Type: application/json" \
  -d '{"name":"Eau potable","category":"eau","quantity":50,"priority":"critical"}'
```

---

## 📁 STRUCTURE DU BUNKER

```
tp3-apocaliste/
├── client/                       # Module d'interface — React + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── StocksPage.jsx
│   │   │   ├── ZonesPage.jsx
│   │   │   └── CrewPage.jsx
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── Dockerfile / Dockerfile.prod
│   ├── index.html, package.json, vite.config.js
│
├── api/                          # API Node.js Express + Mongoose
│   ├── models/
│   │   ├── Stock.js
│   │   ├── Zone.js
│   │   └── Crew.js
│   ├── routes/
│   │   ├── stocks.js
│   │   ├── zones.js
│   │   └── crew.js
│   ├── server.js, package.json, Dockerfile
│
├── nginx/
│   ├── nginx.dev.conf
│   └── nginx.prod.conf
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 🛠 COMMANDES OPÉRATIONNELLES

```bash
# Voir les conteneurs actifs
docker compose ps

# Logs en temps réel
docker compose logs -f
docker compose logs -f api

# Reconstruire un service après modification du Dockerfile
docker compose up --build api

# Entrer dans un conteneur
docker compose exec api sh
docker compose exec database mongosh apocalist

# Vérifier les volumes
docker volume ls
```

---

## ⚠ INCIDENTS & RÉSOLUTIONS

### 1. Live reload de Vite inactif

Le watcher de Vite ne détectait pas les changements via le bind mount selon l'OS. Résolu en activant `usePolling: true` dans `vite.config.js`.

### 2. `node_modules` du conteneur écrasés par le bind mount

Le bind mount `./client:/app` écrasait le `node_modules` installé pendant le build. Résolu en ajoutant un volume anonyme `/app/node_modules` après le bind mount, qui prend la priorité.

### 3. Le navigateur ne résout pas `http://api:5000`

Le DNS Docker (`api`, `database`…) n'est connu qu'à l'intérieur du réseau Docker. En dev, on expose le port 5000 et utilise `VITE_API_URL=http://localhost:5000/api`. En prod, le client utilise `/api` (URL relative) que nginx redirige côté serveur.

### 4. Mount nginx échoué (faux dossier auto-créé)

nginx crashait avec `not a directory: Are you trying to mount a directory onto a file?`. Le fichier `nginx.dev.conf` n'existait pas la première fois — Docker l'avait auto-créé en tant que **dossier vide** (root). Résolu en supprimant le dossier root via un conteneur Docker, puis en recréant le fichier avec la bonne configuration.

---

## 🔒 BONNES PRATIQUES APPLIQUÉES

- ✅ Noms de services explicites (`client`, `api`, `database`, `nginx`)
- ✅ Aucune information sensible dans le code — `MONGO_URL` en variable d'environnement
- ✅ `.env` ignoré par git, `.env.example` versionné comme référence
- ✅ `node_modules`, `dist/`, fichiers temporaires exclus via `.gitignore`
- ✅ Volume nommé `database_data` pour la persistance MongoDB
- ✅ Séparation stricte dev / prod (deux `docker-compose` distincts)
- ✅ En prod, l'API et la base ne sont pas exposées publiquement
- ✅ Images Alpine pour minimiser la taille
- ✅ Multi-stage build du client en prod

---

## 🎯 FONCTIONNALITÉS

- 🛡 **3 modules CRUD complets** (GET, POST, PUT, DELETE) — au-delà du minimum requis
- 📊 **Dashboard avec jauge SVG animée** calculant un indice global pondéré (30 % stocks + 30 % zones + 40 % équipe)
- ⏱ **Compteur "Jour X depuis l'impact"** avec point rouge clignotant et effet LED
- 🎨 **Thème post-apocalyptique cohérent** (palette sombre, accents néon orange, typo monospace)
- ⚡ **Live reload** complet en développement (Vite + nodemon)
- 🌐 **Reverse proxy nginx** masquant l'organisation interne des services

---
```text
╔═══════════════════════════════════════════════╗
║  FIN DE TRANSMISSION                          ║
║  SURVIE AUTONOME RECOMMANDÉE                  ║
║  BUNKER CONTROL ALPHA HORS LIGNE              ║
╚═══════════════════════════════════════════════╝
```
**Apocaliste © Bunker Control — TP3 Docker Compose**
