// ./routes/applications.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/logs', async (req, res) => {
  try {
    const { plot_crop_id } = req.query;
    let query = 'SELECT * FROM application_logs';
    const params = [];
    
    if (plot_crop_id) {
      query += ' WHERE plot_crop_id = ?';
      params.push(plot_crop_id);
    }
    query += ' ORDER BY application_date DESC';
    
    const [logs] = await db.query(query, params);
    res.json({ success: true, data: logs, count: logs.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/logs', async (req, res) => {
  try {
    const { plot_crop_id, application_date } = req.body;
    if (!plot_crop_id || !application_date) {
      return res.status(400).json({ success: false, error: 'Required fields missing' });
    }
    const [result] = await db.query(
      'INSERT INTO application_logs (plot_crop_id, application_date) VALUES (?, ?)',
      [plot_crop_id, application_date]
    );
    res.status(201).json({ success: true, data: { log_id: result.insertId, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;