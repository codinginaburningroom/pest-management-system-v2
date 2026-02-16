// ./routes/crops.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [crops] = await db.query('SELECT * FROM crops ORDER BY crop_name_th');
    res.json({ success: true, data: crops, count: crops.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [crops] = await db.query('SELECT * FROM crops WHERE crop_id = ?', [req.params.id]);
    if (crops.length === 0) {
      return res.status(404).json({ success: false, error: 'Crop not found' });
    }
    res.json({ success: true, data: crops[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id/stages', async (req, res) => {
  try {
    const [stages] = await db.query(
      'SELECT * FROM crop_stages WHERE crop_id = ? ORDER BY stage_order',
      [req.params.id]
    );
    res.json({ success: true, data: stages, count: stages.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { crop_name_th, crop_name_en, scientific_name, crop_type, description } = req.body;
    if (!crop_name_th) {
      return res.status(400).json({ success: false, error: 'crop_name_th required' });
    }
    const [result] = await db.query(
      'INSERT INTO crops (crop_name_th, crop_name_en, scientific_name, crop_type, description) VALUES (?, ?, ?, ?, ?)',
      [crop_name_th, crop_name_en, scientific_name, crop_type, description]
    );
    res.status(201).json({ success: true, data: { crop_id: result.insertId, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;