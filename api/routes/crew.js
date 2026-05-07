const express = require('express');
const Crew = require('../models/Crew');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const members = await Crew.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const member = await Crew.findById(req.params.id);
    if (!member) return res.status(404).json({ error: 'Survivant introuvable' });
    res.json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const member = await Crew.create(req.body);
    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const member = await Crew.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!member) return res.status(404).json({ error: 'Survivant introuvable' });
    res.json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const member = await Crew.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ error: 'Survivant introuvable' });
    res.json({ message: 'Survivant retiré du registre', id: req.params.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;