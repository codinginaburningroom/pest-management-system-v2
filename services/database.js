import * as SQLite from 'expo-sqlite';

let db;

export const initDatabase = async () => {
  db = await SQLite.openDatabaseAsync('pest_management.db');
  
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    -- Farm Entity
    CREATE TABLE IF NOT EXISTS farms (
      farm_id INTEGER PRIMARY KEY AUTOINCREMENT,
      farm_name TEXT NOT NULL,
      location TEXT,
      total_area REAL,
      province TEXT,
      district TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Plot Entity
    CREATE TABLE IF NOT EXISTS plots (
      plot_id INTEGER PRIMARY KEY AUTOINCREMENT,
      farm_id INTEGER NOT NULL,
      plot_name TEXT NOT NULL,
      plot_area REAL,
      soil_type TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farm_id) REFERENCES farms(farm_id) ON DELETE CASCADE
    );
    
    -- Crop Entity
    CREATE TABLE IF NOT EXISTS crops (
      crop_id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop_name_th TEXT NOT NULL,
      crop_name_en TEXT,
      scientific_name TEXT,
      crop_type TEXT,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    -- CropStage Entity
    CREATE TABLE IF NOT EXISTS crop_stages (
      stage_id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop_id INTEGER NOT NULL,
      stage_name TEXT NOT NULL,
      stage_order INTEGER,
      days_from_planting INTEGER,
      description TEXT,
      FOREIGN KEY (crop_id) REFERENCES crops(crop_id) ON DELETE CASCADE
    );
    
    -- Target (Pest/Disease) Entity
    CREATE TABLE IF NOT EXISTS targets (
      target_id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_name_th TEXT NOT NULL,
      target_name_en TEXT,
      scientific_name TEXT,
      target_type TEXT CHECK(target_type IN ('insect', 'fungus', 'weed', 'other')),
      insect_category TEXT CHECK(insect_category IN ('sucking', 'chewing', 'boring', 'other')),
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    -- MoA Group Entity (IRAC/FRAC)
    CREATE TABLE IF NOT EXISTS moa_groups (
      moa_group_id INTEGER PRIMARY KEY AUTOINCREMENT,
      classification_system TEXT CHECK(classification_system IN ('IRAC', 'FRAC', 'HRAC')),
      moa_code TEXT NOT NULL,
      moa_name_th TEXT NOT NULL,
      moa_name_en TEXT,
      mechanism_of_action TEXT,
      target_type TEXT,
      resistance_risk TEXT CHECK(resistance_risk IN ('low', 'medium', 'high')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(classification_system, moa_code)
    );
    
    -- Product Entity
    CREATE TABLE IF NOT EXISTS products (
      product_id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT NOT NULL,
      manufacturer TEXT,
      product_type TEXT CHECK(product_type IN ('insecticide', 'fungicide', 'herbicide')),
      registration_number TEXT,
      active_ingredient TEXT NOT NULL,
      concentration TEXT,
      formulation TEXT,
      moa_group_id INTEGER,
      recommended_rate_min REAL,
      recommended_rate_max REAL,
      rate_unit TEXT,
      phi_days INTEGER,
      safety_interval INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (moa_group_id) REFERENCES moa_groups(moa_group_id)
    );
    
    -- Product-Target Junction (M:N)
    CREATE TABLE IF NOT EXISTS product_targets (
      product_target_id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      target_id INTEGER NOT NULL,
      efficacy_rating INTEGER CHECK(efficacy_rating BETWEEN 1 AND 5),
      notes TEXT,
      FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
      FOREIGN KEY (target_id) REFERENCES targets(target_id) ON DELETE CASCADE,
      UNIQUE(product_id, target_id)
    );
    
    -- PlotCrop Entity (Current planting in plot)
    CREATE TABLE IF NOT EXISTS plot_crops (
      plot_crop_id INTEGER PRIMARY KEY AUTOINCREMENT,
      plot_id INTEGER NOT NULL,
      crop_id INTEGER NOT NULL,
      planting_date TEXT NOT NULL,
      current_stage_id INTEGER,
      harvest_date TEXT,
      status TEXT CHECK(status IN ('active', 'harvested', 'failed')) DEFAULT 'active',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plot_id) REFERENCES plots(plot_id) ON DELETE CASCADE,
      FOREIGN KEY (crop_id) REFERENCES crops(crop_id),
      FOREIGN KEY (current_stage_id) REFERENCES crop_stages(stage_id)
    );
    
    -- ApplicationLog Entity (Header)
    CREATE TABLE IF NOT EXISTS application_logs (
      log_id INTEGER PRIMARY KEY AUTOINCREMENT,
      plot_crop_id INTEGER NOT NULL,
      application_date TEXT NOT NULL,
      application_time TEXT,
      stage_id INTEGER,
      weather_condition TEXT,
      temperature REAL,
      applicator_name TEXT,
      application_method TEXT,
      spray_volume REAL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plot_crop_id) REFERENCES plot_crops(plot_crop_id) ON DELETE CASCADE,
      FOREIGN KEY (stage_id) REFERENCES crop_stages(stage_id)
    );
    
    -- ApplicationItem Entity (Detail/Line items)
    CREATE TABLE IF NOT EXISTS application_items (
      item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      log_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      target_id INTEGER,
      dosage_rate REAL NOT NULL,
      dosage_unit TEXT,
      total_amount REAL,
      moa_group_snapshot TEXT,
      moa_code_snapshot TEXT,
      product_name_snapshot TEXT,
      notes TEXT,
      FOREIGN KEY (log_id) REFERENCES application_logs(log_id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(product_id),
      FOREIGN KEY (target_id) REFERENCES targets(target_id)
    );
    
    -- RotationPolicy Entity
    CREATE TABLE IF NOT EXISTS rotation_policies (
      policy_id INTEGER PRIMARY KEY AUTOINCREMENT,
      policy_name TEXT NOT NULL,
      target_id INTEGER,
      crop_id INTEGER,
      min_rotation_days INTEGER,
      max_consecutive_applications INTEGER,
      moa_sequence TEXT,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (target_id) REFERENCES targets(target_id),
      FOREIGN KEY (crop_id) REFERENCES crops(crop_id)
    );
    
    -- RotationPolicyMoA Junction
    CREATE TABLE IF NOT EXISTS rotation_policy_moa (
      rpm_id INTEGER PRIMARY KEY AUTOINCREMENT,
      policy_id INTEGER NOT NULL,
      moa_group_id INTEGER NOT NULL,
      sequence_order INTEGER,
      FOREIGN KEY (policy_id) REFERENCES rotation_policies(policy_id) ON DELETE CASCADE,
      FOREIGN KEY (moa_group_id) REFERENCES moa_groups(moa_group_id)
    );
    
    -- MoARotationAlert Entity (Violation tracking)
    CREATE TABLE IF NOT EXISTS moa_rotation_alerts (
      alert_id INTEGER PRIMARY KEY AUTOINCREMENT,
      plot_crop_id INTEGER NOT NULL,
      target_id INTEGER,
      moa_group_id INTEGER,
      consecutive_count INTEGER,
      last_application_date TEXT,
      alert_level TEXT CHECK(alert_level IN ('warning', 'danger', 'critical')),
      message TEXT,
      is_resolved INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plot_crop_id) REFERENCES plot_crops(plot_crop_id),
      FOREIGN KEY (target_id) REFERENCES targets(target_id),
      FOREIGN KEY (moa_group_id) REFERENCES moa_groups(moa_group_id)
    );
    
    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_plots_farm ON plots(farm_id);
    CREATE INDEX IF NOT EXISTS idx_plot_crops_plot ON plot_crops(plot_id);
    CREATE INDEX IF NOT EXISTS idx_plot_crops_crop ON plot_crops(crop_id);
    CREATE INDEX IF NOT EXISTS idx_application_logs_plot_crop ON application_logs(plot_crop_id);
    CREATE INDEX IF NOT EXISTS idx_application_items_log ON application_items(log_id);
    CREATE INDEX IF NOT EXISTS idx_application_items_product ON application_items(product_id);
    CREATE INDEX IF NOT EXISTS idx_products_moa ON products(moa_group_id);
    CREATE INDEX IF NOT EXISTS idx_product_targets_product ON product_targets(product_id);
    CREATE INDEX IF NOT EXISTS idx_product_targets_target ON product_targets(target_id);
  `);
  
  return db;
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

// CRUD Operations

// Farm operations
export const createFarm = async (farmData) => {
  const db = getDatabase();
  const result = await db.runAsync(
    'INSERT INTO farms (farm_name, location, total_area, province, district) VALUES (?, ?, ?, ?, ?)',
    farmData.farm_name, farmData.location, farmData.total_area, farmData.province, farmData.district
  );
  return result.lastInsertRowId;
};

export const getAllFarms = async () => {
  const db = getDatabase();
  return await db.getAllAsync('SELECT * FROM farms ORDER BY farm_name');
};

export const getFarmById = async (farmId) => {
  const db = getDatabase();
  return await db.getFirstAsync('SELECT * FROM farms WHERE farm_id = ?', farmId);
};

export const updateFarm = async (farmId, farmData) => {
  const db = getDatabase();
  return await db.runAsync(
    'UPDATE farms SET farm_name = ?, location = ?, total_area = ?, province = ?, district = ?, updated_at = CURRENT_TIMESTAMP WHERE farm_id = ?',
    farmData.farm_name, farmData.location, farmData.total_area, farmData.province, farmData.district, farmId
  );
};

export const deleteFarm = async (farmId) => {
  const db = getDatabase();
  return await db.runAsync('DELETE FROM farms WHERE farm_id = ?', farmId);
};

// Plot operations
export const createPlot = async (plotData) => {
  const db = getDatabase();
  const result = await db.runAsync(
    'INSERT INTO plots (farm_id, plot_name, plot_area, soil_type) VALUES (?, ?, ?, ?)',
    plotData.farm_id, plotData.plot_name, plotData.plot_area, plotData.soil_type
  );
  return result.lastInsertRowId;
};

export const getPlotsByFarm = async (farmId) => {
  const db = getDatabase();
  return await db.getAllAsync('SELECT * FROM plots WHERE farm_id = ? ORDER BY plot_name', farmId);
};

export const getPlotById = async (plotId) => {
  const db = getDatabase();
  return await db.getFirstAsync('SELECT * FROM plots WHERE plot_id = ?', plotId);
};

export const updatePlot = async (plotId, plotData) => {
  const db = getDatabase();
  return await db.runAsync(
    'UPDATE plots SET plot_name = ?, plot_area = ?, soil_type = ?, updated_at = CURRENT_TIMESTAMP WHERE plot_id = ?',
    plotData.plot_name, plotData.plot_area, plotData.soil_type, plotId
  );
};

export const deletePlot = async (plotId) => {
  const db = getDatabase();
  return await db.runAsync('DELETE FROM plots WHERE plot_id = ?', plotId);
};

// Crop operations
export const createCrop = async (cropData) => {
  const db = getDatabase();
  const result = await db.runAsync(
    'INSERT INTO crops (crop_name_th, crop_name_en, scientific_name, crop_type, description) VALUES (?, ?, ?, ?, ?)',
    cropData.crop_name_th, cropData.crop_name_en, cropData.scientific_name, cropData.crop_type, cropData.description
  );
  return result.lastInsertRowId;
};

export const getAllCrops = async () => {
  const db = getDatabase();
  return await db.getAllAsync('SELECT * FROM crops ORDER BY crop_name_th');
};

export const getCropById = async (cropId) => {
  const db = getDatabase();
  return await db.getFirstAsync('SELECT * FROM crops WHERE crop_id = ?', cropId);
};

export const updateCrop = async (cropId, cropData) => {
  const db = getDatabase();
  return await db.runAsync(
    'UPDATE crops SET crop_name_th = ?, crop_name_en = ?, scientific_name = ?, crop_type = ?, description = ? WHERE crop_id = ?',
    cropData.crop_name_th, cropData.crop_name_en, cropData.scientific_name, cropData.crop_type, cropData.description, cropId
  );
};

export const deleteCrop = async (cropId) => {
  const db = getDatabase();
  return await db.runAsync('DELETE FROM crops WHERE crop_id = ?', cropId);
};

// CropStage operations
export const createCropStage = async (stageData) => {
  const db = getDatabase();
  const result = await db.runAsync(
    'INSERT INTO crop_stages (crop_id, stage_name, stage_order, days_from_planting, description) VALUES (?, ?, ?, ?, ?)',
    stageData.crop_id, stageData.stage_name, stageData.stage_order, stageData.days_from_planting, stageData.description
  );
  return result.lastInsertRowId;
};

export const getStagesByCrop = async (cropId) => {
  const db = getDatabase();
  return await db.getAllAsync('SELECT * FROM crop_stages WHERE crop_id = ? ORDER BY stage_order', cropId);
};

export const updateCropStage = async (stageId, stageData) => {
  const db = getDatabase();
  return await db.runAsync(
    'UPDATE crop_stages SET stage_name = ?, stage_order = ?, days_from_planting = ?, description = ? WHERE stage_id = ?',
    stageData.stage_name, stageData.stage_order, stageData.days_from_planting, stageData.description, stageId
  );
};

export const deleteCropStage = async (stageId) => {
  const db = getDatabase();
  return await db.runAsync('DELETE FROM crop_stages WHERE stage_id = ?', stageId);
};

// Target operations
export const createTarget = async (targetData) => {
  const db = getDatabase();
  const result = await db.runAsync(
    'INSERT INTO targets (target_name_th, target_name_en, scientific_name, target_type, insect_category, description) VALUES (?, ?, ?, ?, ?, ?)',
    targetData.target_name_th, targetData.target_name_en, targetData.scientific_name, targetData.target_type, targetData.insect_category, targetData.description
  );
  return result.lastInsertRowId;
};

export const getAllTargets = async () => {
  const db = getDatabase();
  return await db.getAllAsync('SELECT * FROM targets ORDER BY target_name_th');
};

export const getTargetById = async (targetId) => {
  const db = getDatabase();
  return await db.getFirstAsync('SELECT * FROM targets WHERE target_id = ?', targetId);
};

export const getTargetsByType = async (targetType) => {
  const db = getDatabase();
  return await db.getAllAsync('SELECT * FROM targets WHERE target_type = ? ORDER BY target_name_th', targetType);
};

export const getTargetsByInsectCategory = async (insectCategory) => {
  const db = getDatabase();
  return await db.getAllAsync('SELECT * FROM targets WHERE insect_category = ? ORDER BY target_name_th', insectCategory);
};

export const updateTarget = async (targetId, targetData) => {
  const db = getDatabase();
  return await db.runAsync(
    'UPDATE targets SET target_name_th = ?, target_name_en = ?, scientific_name = ?, target_type = ?, insect_category = ?, description = ? WHERE target_id = ?',
    targetData.target_name_th, targetData.target_name_en, targetData.scientific_name, targetData.target_type, targetData.insect_category, targetData.description, targetId
  );
};

export const deleteTarget = async (targetId) => {
  const db = getDatabase();
  return await db.runAsync('DELETE FROM targets WHERE target_id = ?', targetId);
};

// ⭐ เพิ่มฟังก์ชันสำหรับ ProductListScreen
export const getAllInsectCategories = async () => {
  const db = getDatabase();
  return await db.getAllAsync(`
    SELECT DISTINCT insect_category 
    FROM targets 
    WHERE insect_category IS NOT NULL
    ORDER BY insect_category
  `);
};

export const getProductsByInsectCategory = async (insectCategory) => {
  const db = getDatabase();
  return await db.getAllAsync(`
    SELECT DISTINCT p.*, m.moa_code, m.moa_name_th, m.classification_system
    FROM products p
    INNER JOIN product_targets pt ON p.product_id = pt.product_id
    INNER JOIN targets t ON pt.target_id = t.target_id
    LEFT JOIN moa_groups m ON p.moa_group_id = m.moa_group_id
    WHERE t.insect_category = ?
    ORDER BY p.product_name
  `, insectCategory);
};

// MoA Group operations
export const createMoAGroup = async (moaData) => {
  const db = getDatabase();
  const result = await db.runAsync(
    'INSERT INTO moa_groups (classification_system, moa_code, moa_name_th, moa_name_en, mechanism_of_action, target_type, resistance_risk) VALUES (?, ?, ?, ?, ?, ?, ?)',
    moaData.classification_system, moaData.moa_code, moaData.moa_name_th, moaData.moa_name_en, moaData.mechanism_of_action, moaData.target_type, moaData.resistance_risk
  );
  return result.lastInsertRowId;
};

export const getAllMoAGroups = async () => {
  const db = getDatabase();
  return await db.getAllAsync('SELECT * FROM moa_groups ORDER BY classification_system, moa_code');
};

export const getMoAGroupById = async (moaGroupId) => {
  const db = getDatabase();
  return await db.getFirstAsync('SELECT * FROM moa_groups WHERE moa_group_id = ?', moaGroupId);
};

export const getMoAGroupsBySystem = async (system) => {
  const db = getDatabase();
  return await db.getAllAsync('SELECT * FROM moa_groups WHERE classification_system = ? ORDER BY moa_code', system);
};

export const updateMoAGroup = async (moaGroupId, moaData) => {
  const db = getDatabase();
  return await db.runAsync(
    'UPDATE moa_groups SET moa_name_th = ?, moa_name_en = ?, mechanism_of_action = ?, target_type = ?, resistance_risk = ? WHERE moa_group_id = ?',
    moaData.moa_name_th, moaData.moa_name_en, moaData.mechanism_of_action, moaData.target_type, moaData.resistance_risk, moaGroupId
  );
};

export const deleteMoAGroup = async (moaGroupId) => {
  const db = getDatabase();
  return await db.runAsync('DELETE FROM moa_groups WHERE moa_group_id = ?', moaGroupId);
};

// Product operations
export const createProduct = async (productData) => {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO products (product_name, manufacturer, product_type, registration_number, active_ingredient, 
     concentration, formulation, moa_group_id, recommended_rate_min, recommended_rate_max, rate_unit, phi_days, safety_interval) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    productData.product_name, productData.manufacturer, productData.product_type, productData.registration_number,
    productData.active_ingredient, productData.concentration, productData.formulation, productData.moa_group_id,
    productData.recommended_rate_min, productData.recommended_rate_max, productData.rate_unit, productData.phi_days, productData.safety_interval
  );
  return result.lastInsertRowId;
};

export const getAllProducts = async () => {
  const db = getDatabase();
  return await db.getAllAsync(`
    SELECT p.*, m.moa_code, m.moa_name_th, m.classification_system
    FROM products p
    LEFT JOIN moa_groups m ON p.moa_group_id = m.moa_group_id
    ORDER BY p.product_name
  `);
};

export const getProductById = async (productId) => {
  const db = getDatabase();
  return await db.getFirstAsync(`
    SELECT p.*, m.moa_code, m.moa_name_th, m.classification_system
    FROM products p
    LEFT JOIN moa_groups m ON p.moa_group_id = m.moa_group_id
    WHERE p.product_id = ?
  `, productId);
};

export const getProductsByType = async (productType) => {
  const db = getDatabase();
  return await db.getAllAsync(`
    SELECT p.*, m.moa_code, m.moa_name_th, m.classification_system
    FROM products p
    LEFT JOIN moa_groups m ON p.moa_group_id = m.moa_group_id
    WHERE p.product_type = ?
    ORDER BY p.product_name
  `, productType);
};

export const getProductsByMoA = async (moaGroupId) => {
  const db = getDatabase();
  return await db.getAllAsync('SELECT * FROM products WHERE moa_group_id = ? ORDER BY product_name', moaGroupId);
};

export const updateProduct = async (productId, productData) => {
  const db = getDatabase();
  return await db.runAsync(
    `UPDATE products SET product_name = ?, manufacturer = ?, product_type = ?, registration_number = ?, 
     active_ingredient = ?, concentration = ?, formulation = ?, moa_group_id = ?, 
     recommended_rate_min = ?, recommended_rate_max = ?, rate_unit = ?, phi_days = ?, safety_interval = ? 
     WHERE product_id = ?`,
    productData.product_name, productData.manufacturer, productData.product_type, productData.registration_number,
    productData.active_ingredient, productData.concentration, productData.formulation, productData.moa_group_id,
    productData.recommended_rate_min, productData.recommended_rate_max, productData.rate_unit, 
    productData.phi_days, productData.safety_interval, productId
  );
};

export const deleteProduct = async (productId) => {
  const db = getDatabase();
  return await db.runAsync('DELETE FROM products WHERE product_id = ?', productId);
};

// Product-Target operations
export const linkProductToTarget = async (productId, targetId, efficacyRating, notes) => {
  const db = getDatabase();
  const result = await db.runAsync(
    'INSERT INTO product_targets (product_id, target_id, efficacy_rating, notes) VALUES (?, ?, ?, ?)',
    productId, targetId, efficacyRating, notes
  );
  return result.lastInsertRowId;
};

export const getProductsForTarget = async (targetId) => {
  const db = getDatabase();
  return await db.getAllAsync(`
    SELECT p.*, pt.efficacy_rating, m.moa_code, m.moa_name_th
    FROM products p
    INNER JOIN product_targets pt ON p.product_id = pt.product_id
    LEFT JOIN moa_groups m ON p.moa_group_id = m.moa_group_id
    WHERE pt.target_id = ?
    ORDER BY pt.efficacy_rating DESC, p.product_name
  `, targetId);
};

export const getTargetsForProduct = async (productId) => {
  const db = getDatabase();
  return await db.getAllAsync(`
    SELECT t.*, pt.efficacy_rating, pt.notes
    FROM targets t
    INNER JOIN product_targets pt ON t.target_id = pt.target_id
    WHERE pt.product_id = ?
    ORDER BY t.target_name_th
  `, productId);
};

export const updateProductTargetEfficacy = async (productId, targetId, efficacyRating, notes) => {
  const db = getDatabase();
  return await db.runAsync(
    'UPDATE product_targets SET efficacy_rating = ?, notes = ? WHERE product_id = ? AND target_id = ?',
    efficacyRating, notes, productId, targetId
  );
};

export const unlinkProductFromTarget = async (productId, targetId) => {
  const db = getDatabase();
  return await db.runAsync(
    'DELETE FROM product_targets WHERE product_id = ? AND target_id = ?',
    productId, targetId
  );
};

// PlotCrop operations
export const createPlotCrop = async (plotCropData) => {
  const db = getDatabase();
  const result = await db.runAsync(
    'INSERT INTO plot_crops (plot_id, crop_id, planting_date, current_stage_id, status, notes) VALUES (?, ?, ?, ?, ?, ?)',
    plotCropData.plot_id, plotCropData.crop_id, plotCropData.planting_date, plotCropData.current_stage_id, plotCropData.status || 'active', plotCropData.notes
  );
  return result.lastInsertRowId;
};

export const getActivePlotCrops = async (plotId) => {
  const db = getDatabase();
  return await db.getAllAsync(`
    SELECT pc.*, c.crop_name_th, c.crop_name_en, cs.stage_name, p.plot_name
    FROM plot_crops pc
    INNER JOIN crops c ON pc.crop_id = c.crop_id
    LEFT JOIN crop_stages cs ON pc.current_stage_id = cs.stage_id
    INNER JOIN plots p ON pc.plot_id = p.plot_id
    WHERE pc.plot_id = ? AND pc.status = 'active'
    ORDER BY pc.planting_date DESC
  `, plotId);
};

export const getPlotCropById = async (plotCropId) => {
  const db = getDatabase();
  return await db.getFirstAsync(`
    SELECT pc.*, c.crop_name_th, c.crop_name_en, cs.stage_name, p.plot_name, p.farm_id
    FROM plot_crops pc
    INNER JOIN crops c ON pc.crop_id = c.crop_id
    LEFT JOIN crop_stages cs ON pc.current_stage_id = cs.stage_id
    INNER JOIN plots p ON pc.plot_id = p.plot_id
    WHERE pc.plot_crop_id = ?
  `, plotCropId);
};

export const updatePlotCropStage = async (plotCropId, stageId) => {
  const db = getDatabase();
  return await db.runAsync(
    'UPDATE plot_crops SET current_stage_id = ?, updated_at = CURRENT_TIMESTAMP WHERE plot_crop_id = ?',
    stageId, plotCropId
  );
};

export const updatePlotCropStatus = async (plotCropId, status, harvestDate) => {
  const db = getDatabase();
  return await db.runAsync(
    'UPDATE plot_crops SET status = ?, harvest_date = ?, updated_at = CURRENT_TIMESTAMP WHERE plot_crop_id = ?',
    status, harvestDate, plotCropId
  );
};

export const deletePlotCrop = async (plotCropId) => {
  const db = getDatabase();
  return await db.runAsync('DELETE FROM plot_crops WHERE plot_crop_id = ?', plotCropId);
};

// ApplicationLog operations
export const createApplicationLog = async (logData) => {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO application_logs (plot_crop_id, application_date, application_time, stage_id, 
     weather_condition, temperature, applicator_name, application_method, spray_volume, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    logData.plot_crop_id, logData.application_date, logData.application_time, logData.stage_id,
    logData.weather_condition, logData.temperature, logData.applicator_name, logData.application_method,
    logData.spray_volume, logData.notes
  );
  return result.lastInsertRowId;
};

export const getApplicationLogsByPlotCrop = async (plotCropId) => {
  const db = getDatabase();
  return await db.getAllAsync(`
    SELECT al.*, cs.stage_name
    FROM application_logs al
    LEFT JOIN crop_stages cs ON al.stage_id = cs.stage_id
    WHERE al.plot_crop_id = ?
    ORDER BY al.application_date DESC, al.application_time DESC
  `, plotCropId);
};

export const getApplicationLogById = async (logId) => {
  const db = getDatabase();
  return await db.getFirstAsync(`
    SELECT al.*, cs.stage_name
    FROM application_logs al
    LEFT JOIN crop_stages cs ON al.stage_id = cs.stage_id
    WHERE al.log_id = ?
  `, logId);
};

export const updateApplicationLog = async (logId, logData) => {
  const db = getDatabase();
  return await db.runAsync(
    `UPDATE application_logs SET application_date = ?, application_time = ?, stage_id = ?, 
     weather_condition = ?, temperature = ?, applicator_name = ?, application_method = ?, 
     spray_volume = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE log_id = ?`,
    logData.application_date, logData.application_time, logData.stage_id, logData.weather_condition,
    logData.temperature, logData.applicator_name, logData.application_method, logData.spray_volume,
    logData.notes, logId
  );
};

export const deleteApplicationLog = async (logId) => {
  const db = getDatabase();
  return await db.runAsync('DELETE FROM application_logs WHERE log_id = ?', logId);
};

// ApplicationItem operations
export const createApplicationItem = async (itemData) => {
  const db = getDatabase();
  
  // Get MoA snapshot
  const product = await db.getFirstAsync(`
    SELECT p.product_name, m.moa_name_th, m.moa_code
    FROM products p
    LEFT JOIN moa_groups m ON p.moa_group_id = m.moa_group_id
    WHERE p.product_id = ?
  `, itemData.product_id);
  
  const result = await db.runAsync(
    `INSERT INTO application_items (log_id, product_id, target_id, dosage_rate, dosage_unit, 
     total_amount, moa_group_snapshot, moa_code_snapshot, product_name_snapshot, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    itemData.log_id, itemData.product_id, itemData.target_id, itemData.dosage_rate, itemData.dosage_unit,
    itemData.total_amount, product?.moa_name_th, product?.moa_code, product?.product_name, itemData.notes
  );
  return result.lastInsertRowId;
};

export const getApplicationItemsByLog = async (logId) => {
  const db = getDatabase();
  return await db.getAllAsync(`
    SELECT ai.*, p.product_name, t.target_name_th, m.moa_code, m.moa_name_th
    FROM application_items ai
    INNER JOIN products p ON ai.product_id = p.product_id
    LEFT JOIN targets t ON ai.target_id = t.target_id
    LEFT JOIN moa_groups m ON p.moa_group_id = m.moa_group_id
    WHERE ai.log_id = ?
  `, logId);
};

export const updateApplicationItem = async (itemId, itemData) => {
  const db = getDatabase();
  return await db.runAsync(
    `UPDATE application_items SET product_id = ?, target_id = ?, dosage_rate = ?, 
     dosage_unit = ?, total_amount = ?, notes = ? WHERE item_id = ?`,
    itemData.product_id, itemData.target_id, itemData.dosage_rate, itemData.dosage_unit,
    itemData.total_amount, itemData.notes, itemId
  );
};

export const deleteApplicationItem = async (itemId) => {
  const db = getDatabase();
  return await db.runAsync('DELETE FROM application_items WHERE item_id = ?', itemId);
};

// MoA Rotation Analysis
export const getMoAUsageHistory = async (plotCropId, targetId, limit = 10) => {
  const db = getDatabase();
  return await db.getAllAsync(`
    SELECT 
      al.application_date,
      ai.moa_code_snapshot,
      ai.moa_group_snapshot,
      ai.product_name_snapshot,
      t.target_name_th,
      COUNT(*) as usage_count
    FROM application_items ai
    INNER JOIN application_logs al ON ai.log_id = al.log_id
    LEFT JOIN targets t ON ai.target_id = t.target_id
    WHERE al.plot_crop_id = ? 
      AND (ai.target_id = ? OR ? IS NULL)
    GROUP BY al.application_date, ai.moa_code_snapshot, ai.target_id
    ORDER BY al.application_date DESC
    LIMIT ?
  `, plotCropId, targetId, targetId, limit);
};

export const checkMoARotation = async (plotCropId, targetId) => {
  const db = getDatabase();
  
  // Get last 3 applications for the target
  const recentApps = await db.getAllAsync(`
    SELECT 
      ai.moa_code_snapshot,
      al.application_date,
      COUNT(*) as consecutive_count
    FROM application_items ai
    INNER JOIN application_logs al ON ai.log_id = al.log_id
    WHERE al.plot_crop_id = ? AND ai.target_id = ?
    GROUP BY ai.moa_code_snapshot, al.application_date
    ORDER BY al.application_date DESC
    LIMIT 3
  `, plotCropId, targetId);
  
  // Check if same MoA used consecutively
  if (recentApps.length >= 2) {
    const moaCodes = recentApps.map(app => app.moa_code_snapshot);
    if (moaCodes[0] === moaCodes[1]) {
      return {
        warning: true,
        message: `พบการใช้ MoA ${moaCodes[0]} ติดต่อกัน ${moaCodes.filter(m => m === moaCodes[0]).length} ครั้ง - ควรหมุนเวียนกลุ่ม MoA`,
        currentMoA: moaCodes[0],
        consecutiveCount: moaCodes.filter(m => m === moaCodes[0]).length
      };
    }
  }
  
  return { warning: false, message: 'การหมุนเวียน MoA เหมาะสม' };
};

// Recommendation Engine
export const getRecommendedProducts = async (targetId, plotCropId, excludeMoACodes = []) => {
  const db = getDatabase();
  
  let excludeClause = '';
  if (excludeMoACodes.length > 0) {
    const placeholders = excludeMoACodes.map(() => '?').join(',');
    excludeClause = `AND m.moa_code NOT IN (${placeholders})`;
  }
  
  const query = `
    SELECT 
      p.*,
      m.moa_code,
      m.moa_name_th,
      m.classification_system,
      pt.efficacy_rating,
      CASE 
        WHEN m.moa_code IN (
          SELECT DISTINCT ai.moa_code_snapshot 
          FROM application_items ai
          INNER JOIN application_logs al ON ai.log_id = al.log_id
          WHERE al.plot_crop_id = ? AND ai.target_id = ?
          ORDER BY al.application_date DESC
          LIMIT 2
        ) THEN 1
        ELSE 0
      END as recently_used
    FROM products p
    INNER JOIN product_targets pt ON p.product_id = pt.product_id
    LEFT JOIN moa_groups m ON p.moa_group_id = m.moa_group_id
    WHERE pt.target_id = ? ${excludeClause}
    ORDER BY recently_used ASC, pt.efficacy_rating DESC, p.product_name
  `;
  
  const params = [plotCropId, targetId, targetId, ...excludeMoACodes];
  return await db.getAllAsync(query, ...params);
};

export default {
  initDatabase,
  getDatabase,
  // Farm
  createFarm,
  getAllFarms,
  getFarmById,
  updateFarm,
  deleteFarm,
  // Plot
  createPlot,
  getPlotsByFarm,
  getPlotById,
  updatePlot,
  deletePlot,
  // Crop
  createCrop,
  getAllCrops,
  getCropById,
  updateCrop,
  deleteCrop,
  // CropStage
  createCropStage,
  getStagesByCrop,
  updateCropStage,
  deleteCropStage,
  // Target
  createTarget,
  getAllTargets,
  getTargetById,
  getTargetsByType,
  getTargetsByInsectCategory,
  updateTarget,
  deleteTarget,
  getAllInsectCategories,
  getProductsByInsectCategory,
  // MoA Group
  createMoAGroup,
  getAllMoAGroups,
  getMoAGroupById,
  getMoAGroupsBySystem,
  updateMoAGroup,
  deleteMoAGroup,
  // Product
  createProduct,
  getAllProducts,
  getProductById,
  getProductsByType,
  getProductsByMoA,
  updateProduct,
  deleteProduct,
  // Product-Target
  linkProductToTarget,
  getProductsForTarget,
  getTargetsForProduct,
  updateProductTargetEfficacy,
  unlinkProductFromTarget,
  // PlotCrop
  createPlotCrop,
  getActivePlotCrops,
  getPlotCropById,
  updatePlotCropStage,
  updatePlotCropStatus,
  deletePlotCrop,
  // ApplicationLog
  createApplicationLog,
  getApplicationLogsByPlotCrop,
  getApplicationLogById,
  updateApplicationLog,
  deleteApplicationLog,
  // ApplicationItem
  createApplicationItem,
  getApplicationItemsByLog,
  updateApplicationItem,
  deleteApplicationItem,
  // MoA Analysis
  getMoAUsageHistory,
  checkMoARotation,
  getRecommendedProducts
};