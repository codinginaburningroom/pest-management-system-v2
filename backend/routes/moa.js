// ./routes/moa.js

const express = require('express');
const router = express.Router();
const db = require('../config/database');


// =====================================================
// GET ALL MOA GROUPS
// =====================================================
router.get('/groups', async (req, res) => {
  try {
    const [groups] = await db.query(
      'SELECT * FROM moa_groups ORDER BY classification_system, moa_code'
    );

    res.json({
      success: true,
      data: groups,
      count: groups.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// =====================================================
// GET MOA GROUPS BY SYSTEM (IRAC / FRAC / HRAC)
// =====================================================
router.get('/groups/system/:system', async (req, res) => {
  try {
    const system = req.params.system;

    const [groups] = await db.query(
      'SELECT * FROM moa_groups WHERE classification_system = ? ORDER BY moa_code',
      [system]
    );

    res.json({
      success: true,
      data: groups,
      count: groups.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// =====================================================
// CHECK MOA ROTATION
// =====================================================
router.get('/check-rotation', async (req, res) => {
  try {
    const { plotCropId } = req.query;

    const [rows] = await db.query(`
      SELECT mg.moa_code, mg.classification_system
      FROM application_logs al
      JOIN application_items ai ON al.log_id = ai.log_id
      JOIN products p ON ai.product_id = p.product_id
      JOIN moa_groups mg ON p.moa_group_id = mg.moa_group_id
      WHERE al.plot_crop_id = ?
      ORDER BY al.application_date DESC
      LIMIT 1
    `, [plotCropId]);

    if (rows.length === 0) {
      return res.json({ warning: false });
    }

    res.json({
      warning: true,
      lastMoA: rows[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// =====================================================
// GET MOA USAGE HISTORY
// =====================================================
router.get('/usage-history', async (req, res) => {
  try {
    const { plotCropId, limit = 5 } = req.query;

    const [rows] = await db.query(`
      SELECT mg.moa_code, mg.classification_system, al.application_date
      FROM application_logs al
      JOIN application_items ai ON al.log_id = ai.log_id
      JOIN products p ON ai.product_id = p.product_id
      JOIN moa_groups mg ON p.moa_group_id = mg.moa_group_id
      WHERE al.plot_crop_id = ?
      ORDER BY al.application_date DESC
      LIMIT ?
    `, [plotCropId, Number(limit)]);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// =====================================================
// GET RECOMMENDED PRODUCTS
// =====================================================
router.get('/recommendations', async (req, res) => {
  try {
    const { targetId, recentMoACodes = '' } = req.query;

    const excludedCodes = recentMoACodes
      ? recentMoACodes.split(',')
      : [];

    let query = `
      SELECT DISTINCT p.*
      FROM products p
      JOIN product_targets pt ON p.product_id = pt.product_id
      JOIN moa_groups mg ON p.moa_group_id = mg.moa_group_id
      WHERE pt.target_id = ?
    `;

    const params = [targetId];

    if (excludedCodes.length > 0) {
      query += ` AND mg.moa_code NOT IN (${excludedCodes.map(() => '?').join(',')})`;
      params.push(...excludedCodes);
    }

    const [products] = await db.query(query, params);

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


module.exports = router;
