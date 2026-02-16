// ./routes/farms.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [farms] = await db.query('SELECT * FROM farms ORDER BY farm_name');
    res.json({ success: true, data: farms, count: farms.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [farms] = await db.query('SELECT * FROM farms WHERE farm_id = ?', [req.params.id]);
    if (farms.length === 0) {
      return res.status(404).json({ success: false, error: 'Farm not found' });
    }
    res.json({ success: true, data: farms[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { farm_name, location, total_area, province, district } = req.body;
    if (!farm_name) {
      return res.status(400).json({ success: false, error: 'farm_name is required' });
    }
    const [result] = await db.query(
      'INSERT INTO farms (farm_name, location, total_area, province, district) VALUES (?, ?, ?, ?, ?)',
      [farm_name, location, total_area, province, district]
    );
    res.status(201).json({ success: true, data: { farm_id: result.insertId, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { farm_name, location, total_area, province, district } = req.body;
    const [result] = await db.query(
      'UPDATE farms SET farm_name = ?, location = ?, total_area = ?, province = ?, district = ? WHERE farm_id = ?',
      [farm_name, location, total_area, province, district, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Farm not found' });
    }
    res.json({ success: true, message: 'Farm updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM farms WHERE farm_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Farm not found' });
    }
    res.json({ success: true, message: 'Farm deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id/plots', async (req, res) => {
  try {
    const [plots] = await db.query('SELECT * FROM plots WHERE farm_id = ? ORDER BY plot_name', [req.params.id]);
    res.json({ success: true, data: plots, count: plots.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;