// ./routes/plots.js

const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const { farm_id } = req.query;
    let query = 'SELECT * FROM plots';
    const params = [];
    if (farm_id) {
      query += ' WHERE farm_id = ?';
      params.push(farm_id);
    }
    query += ' ORDER BY plot_name';
    const [plots] = await db.query(query, params);
    res.json({ success: true, data: plots, count: plots.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [plots] = await db.query('SELECT * FROM plots WHERE plot_id = ?', [req.params.id]);
    if (plots.length === 0) {
      return res.status(404).json({ success: false, error: 'Plot not found' });
    }
    res.json({ success: true, data: plots[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { farm_id, plot_name, plot_area, soil_type } = req.body;
    if (!farm_id || !plot_name) {
      return res.status(400).json({ success: false, error: 'farm_id and plot_name required' });
    }
    const [result] = await db.query(
      'INSERT INTO plots (farm_id, plot_name, plot_area, soil_type) VALUES (?, ?, ?, ?)',
      [farm_id, plot_name, plot_area, soil_type]
    );
    res.status(201).json({ success: true, data: { plot_id: result.insertId, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { plot_name, plot_area, soil_type } = req.body;
    const [result] = await db.query(
      'UPDATE plots SET plot_name = ?, plot_area = ?, soil_type = ? WHERE plot_id = ?',
      [plot_name, plot_area, soil_type, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Plot not found' });
    }
    res.json({ success: true, message: 'Plot updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM plots WHERE plot_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Plot not found' });
    }
    res.json({ success: true, message: 'Plot deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;    