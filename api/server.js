require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const stocksRouter = require('./routes/stocks');
const zonesRouter = require('./routes/zones');
const crewRouter = require('./routes/crew');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://database:27017/Apocalistee';

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API du bunker Apocalistee opérationnelle',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/stocks', stocksRouter);
app.use('/api/zones', zonesRouter);
app.use('/api/crew', crewRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Route inconnue dans le bunker' });
});

async function start() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log(`[BUNKER] Connecté à MongoDB : ${MONGO_URL}`);

    app.listen(PORT, () => {
      console.log(`[BUNKER] API à l'écoute sur le port ${PORT}`);
    });
  } catch (err) {
    console.error('[BUNKER] Échec de connexion à MongoDB :', err.message);
    process.exit(1);
  }
}

start();