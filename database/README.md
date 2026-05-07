# 🗄 Service Database — MongoDB

Ce dossier contient la configuration du service de base de données du bunker Apocaliste.

## Contenu

- **`Dockerfile`** — étend l'image officielle `mongo:7` du Docker Hub
- **`init.js`** — script d'initialisation exécuté au premier démarrage de la base. Il crée les 3 collections (`stocks`, `zones`, `crew`) et les index associés.

## Persistance

Les données sont stockées dans un **volume Docker nommé** `database_data` (déclaré dans `docker-compose.yml`). Elles survivent à `docker compose down` mais sont effacées par `docker compose down -v`.

## Connexion

Les autres services se connectent via le DNS Docker :

```
mongodb://database:27017/apocalist
```