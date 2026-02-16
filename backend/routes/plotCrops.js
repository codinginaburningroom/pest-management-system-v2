// ./routes/plotCrops.js

const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const { plot_id, status } = req.query;
    let query = `
      SELECT pc.*, c.crop_name_th, c.crop_name_en, p.plot_name
      FROM plot_crops pc
      INNER JOIN crops c ON pc.crop_id = c.crop_id
      INNER JOIN plots p ON pc.plot_id = p.plot_id
    `;
    const conditions = [];
    const params = [];
    
    if (plot_id) {
      conditions.push('pc.plot_id = ?');
      params.push(plot_id);
    }
    if (status) {
      conditions.push('pc.status = ?');
      params.push(status);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY pc.planting_date DESC';
    
    const [plotCrops] = await db.query(query, params);
    res.json({ success: true, data: plotCrops, count: plotCrops.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { plot_id, crop_id, planting_date, status, notes } = req.body;
    if (!plot_id || !crop_id || !planting_date) {
      return res.status(400).json({ success: false, error: 'Required fields missing' });
    }
    const [result] = await db.query(
      'INSERT INTO plot_crops (plot_id, crop_id, planting_date, status, notes) VALUES (?, ?, ?, ?, ?)',
      [plot_id, crop_id, planting_date, status || 'active', notes]
    );
    res.status(201).json({ success: true, data: { plot_crop_id: result.insertId, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;