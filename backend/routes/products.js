// ./routes/products.js

const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT p.*, m.moa_code, m.moa_name_th, m.classification_system
      FROM products p
      LEFT JOIN moa_groups m ON p.moa_group_id = m.moa_group_id
      ORDER BY p.product_name
    `);
    res.json({ success: true, data: products, count: products.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT p.*, m.moa_code, m.moa_name_th, m.classification_system
      FROM products p
      LEFT JOIN moa_groups m ON p.moa_group_id = m.moa_group_id
      WHERE p.product_id = ?
    `, [req.params.id]);
    if (products.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: products[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { product_name, manufacturer, product_type, active_ingredient, moa_group_id } = req.body;
    if (!product_name || !active_ingredient || !product_type) {
      return res.status(400).json({ success: false, error: 'Required fields missing' });
    }
    const [result] = await db.query(
      'INSERT INTO products (product_name, manufacturer, product_type, active_ingredient, moa_group_id) VALUES (?, ?, ?, ?, ?)',
      [product_name, manufacturer, product_type, active_ingredient, moa_group_id]
    );
    res.status(201).json({ success: true, data: { product_id: result.insertId, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;