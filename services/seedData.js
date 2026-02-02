import * as DB from './database';

const upsertMoAGroup = async (moa) => {
  const existing = await DB.getAllMoAGroups();
  const found = existing.find(
    m =>
      m.classification_system === moa.classification_system &&
      m.moa_code === moa.moa_code
  );
  if (found) return found.moa_group_id;
  return await DB.createMoAGroup(moa);
};

const upsertTarget = async (target) => {
  const all = await DB.getAllTargets();
  const found = all.find(t => t.target_name_en === target.target_name_en);
  if (found) return found.target_id;
  return await DB.createTarget(target);
};

const upsertCrop = async (crop) => {
  const all = await DB.getAllCrops();
  const found = all.find(c => c.crop_name_en === crop.crop_name_en);
  if (found) return found.crop_id;
  return await DB.createCrop(crop);
};

export const seedInitialData = async () => {
  try {
    console.log('🌱 Starting data seeding...');

    /* ================= MoA GROUPS ================= */

    const iracGroups = [
      { classification_system: 'IRAC', moa_code: '1A', moa_name_th: 'Carbamates', target_type: 'insect', resistance_risk: 'high' },
      { classification_system: 'IRAC', moa_code: '1B', moa_name_th: 'Organophosphates', target_type: 'insect', resistance_risk: 'high' },
      { classification_system: 'IRAC', moa_code: '3A', moa_name_th: 'Pyrethroids', target_type: 'insect', resistance_risk: 'high' },
      { classification_system: 'IRAC', moa_code: '4A', moa_name_th: 'Neonicotinoids', target_type: 'insect', resistance_risk: 'medium' },
      { classification_system: 'IRAC', moa_code: '5', moa_name_th: 'Spinosyns', target_type: 'insect', resistance_risk: 'low' },
      { classification_system: 'IRAC', moa_code: '6', moa_name_th: 'Avermectins', target_type: 'insect', resistance_risk: 'medium' },
      { classification_system: 'IRAC', moa_code: '28', moa_name_th: 'Diamides', target_type: 'insect', resistance_risk: 'low' }
    ];

    const fracGroups = [
      { classification_system: 'FRAC', moa_code: '1', moa_name_th: 'MBC', target_type: 'fungus', resistance_risk: 'high' },
      { classification_system: 'FRAC', moa_code: '3', moa_name_th: 'DMI', target_type: 'fungus', resistance_risk: 'medium' },
      { classification_system: 'FRAC', moa_code: '7', moa_name_th: 'SDHI', target_type: 'fungus', resistance_risk: 'medium' },
      { classification_system: 'FRAC', moa_code: '11', moa_name_th: 'QoI', target_type: 'fungus', resistance_risk: 'high' },
      { classification_system: 'FRAC', moa_code: 'M', moa_name_th: 'Multi-site', target_type: 'fungus', resistance_risk: 'low' }
    ];

    const moaIds = {};
    for (const moa of [...iracGroups, ...fracGroups]) {
      moaIds[`${moa.classification_system}_${moa.moa_code}`] = await upsertMoAGroup(moa);
    }

    /* ================= TARGETS ================= */

    const targets = [
      { target_name_th: 'เพลี้ยไฟ', target_name_en: 'Thrips', target_type: 'insect' },
      { target_name_th: 'เพลี้ยอ่อน', target_name_en: 'Aphids', target_type: 'insect' },
      { target_name_th: 'หนอนเจาะผล', target_name_en: 'Fruit borer', target_type: 'insect' },
      { target_name_th: 'โรคแอนแทรคโนส', target_name_en: 'Anthracnose', target_type: 'fungus' }
    ];

    const targetIds = {};
    for (const t of targets) {
      targetIds[t.target_name_en] = await upsertTarget(t);
    }

    /* ================= CROPS ================= */

    const crops = [
      { crop_name_th: 'มะม่วง', crop_name_en: 'Mango', crop_type: 'fruit' },
      { crop_name_th: 'มะนาว', crop_name_en: 'Lime', crop_type: 'fruit' }
    ];

    const cropIds = {};
    for (const crop of crops) {
      cropIds[crop.crop_name_en] = await upsertCrop(crop);
    }

    console.log('✅ Data seeding completed (safe + idempotent)');
    return { success: true };

  } catch (err) {
    console.error('❌ Seeding failed:', err);
    return { success: false, message: err.message };
  }
};
