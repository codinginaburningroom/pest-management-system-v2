// ./routes/targets.js

const express = require('express');
const router = express.Router();
const db = require('../config/database');


// =====================================================
// GET ALL TARGETS (with filter)
// =====================================================
router.get('/', async (req, res) => {
  try {
    const { type, insect_category } = req.query;

    let query = 'SELECT * FROM targets';
    const conditions = [];
    const params = [];

    if (type) {
      conditions.push('target_type = ?');
      params.push(type);
    }

    if (insect_category) {
      conditions.push('insect_category = ?');
      params.push(insect_category);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY target_name_th';

    const [targets] = await db.query(query, params);

    res.json({
      success: true,
      data: targets,
      count: targets.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// =====================================================
// GET DISTINCT INSECT CATEGORIES
// =====================================================
router.get('/categories/insects', async (req, res) => {
  try {
    const [categories] = await db.query(
      `SELECT DISTINCT insect_category 
       FROM targets 
       WHERE insect_category IS NOT NULL 
       ORDER BY insect_category`
    );

    res.json({
      success: true,
      data: categories.map(c => c.insect_category)
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// =====================================================
// GET PRODUCTS FOR A TARGET
// IMPORTANT: Must be before '/:id'
// =====================================================
router.get('/:id/products', async (req, res) => {
  try {
    const targetId = req.params.id;

    const [products] = await db.query(`
      SELECT p.*
      FROM products p
      JOIN product_targets pt ON p.product_id = pt.product_id
      WHERE pt.target_id = ?
    `, [targetId]);

    res.json({
      success: true,
      data: products,
      count: products.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// =====================================================
// GET TARGET BY ID
// =====================================================
router.get('/:id', async (req, res) => {
  try {
    const [targets] = await db.query(
      'SELECT * FROM targets WHERE target_id = ?',
      [req.params.id]
    );

    if (targets.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Target not found'
      });
    }

    res.json({
      success: true,
      data: targets[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// =====================================================
// CREATE TARGET
// =====================================================
router.post('/', async (req, res) => {
  try {
    const {
      target_name_th,
      target_name_en,
      scientific_name,
      target_type,
      insect_category,
      description
    } = req.body;

    if (!target_name_th || !target_type) {
      return res.status(400).json({
        success: false,
        error: 'target_name_th and target_type required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO targets 
       (target_name_th, target_name_en, scientific_name, target_type, insect_category, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        target_name_th,
        target_name_en,
        scientific_name,
        target_type,
        insect_category,
        description
      ]
    );

    res.status(201).json({
      success: true,
      data: {
        target_id: result.insertId,
        ...req.body
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// =====================================================
// UPDATE TARGET
// =====================================================
router.put('/:id', async (req, res) => {
  try {
    const {
      target_name_th,
      target_name_en,
      scientific_name,
      target_type,
      insect_category,
      description
    } = req.body;

    const [result] = await db.query(
      `UPDATE targets SET
        target_name_th = ?,
        target_name_en = ?,
        scientific_name = ?,
        target_type = ?,
        insect_category = ?,
        description = ?
       WHERE target_id = ?`,
      [
        target_name_th,
        target_name_en,
        scientific_name,
        target_type,
        insect_category,
        description,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Target not found'
      });
    }

    res.json({
      success: true,
      message: 'Target updated successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// =====================================================
// DELETE TARGET
// =====================================================
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM targets WHERE target_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Target not found'
      });
    }

    res.json({
      success: true,
      message: 'Target deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


module.exports = router;
