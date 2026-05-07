// Script d'initialisation de la base apocaliste
// Exécuté automatiquement au premier démarrage de MongoDB

db = db.getSiblingDB('apocalist');

// Création explicite des 3 collections du bunker
db.createCollection('stocks');
db.createCollection('zones');
db.createCollection('crew');

// Index pour accélérer les requêtes
db.stocks.createIndex({ priority: 1 });
db.zones.createIndex({ status: 1 });
db.crew.createIndex({ state: 1 });

print('[BUNKER DB] Base apocalist initialisée avec 3 collections.');