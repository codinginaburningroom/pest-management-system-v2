import * as DB from '../services/database';

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
    console.log('🌱 Starting comprehensive data seeding...\n');

    /* ================= MoA GROUPS ================= */
    console.log('📋 Adding MoA Groups...');

    const iracGroups = [
      { classification_system: 'IRAC', moa_code: '1A', moa_name_th: 'คาร์บาเมท (Carbamates)', moa_name_en: 'Carbamates', mechanism_of_action: 'ยับยั้งเอนไซม์ Acetylcholinesterase', target_type: 'insect', resistance_risk: 'high' },
      { classification_system: 'IRAC', moa_code: '1B', moa_name_th: 'ออร์กาโนฟอสเฟต (Organophosphates)', moa_name_en: 'Organophosphates', mechanism_of_action: 'ยับยั้งเอนไซม์ Acetylcholinesterase', target_type: 'insect', resistance_risk: 'high' },
      { classification_system: 'IRAC', moa_code: '3A', moa_name_th: 'ไพรีทรอยด์ (Pyrethroids)', moa_name_en: 'Pyrethroids', mechanism_of_action: 'ทำให้ช่องโซเดียมทำงานผิดปกติ', target_type: 'insect', resistance_risk: 'high' },
      { classification_system: 'IRAC', moa_code: '4A', moa_name_th: 'นีโอนิโคตินอยด์ (Neonicotinoids)', moa_name_en: 'Neonicotinoids', mechanism_of_action: 'กระตุ้นตัวรับ Nicotinic Acetylcholine', target_type: 'insect', resistance_risk: 'medium' },
      { classification_system: 'IRAC', moa_code: '5', moa_name_th: 'สไปโนซิน (Spinosyns)', moa_name_en: 'Spinosyns', mechanism_of_action: 'กระตุ้นตัวรับ Nicotinic Acetylcholine', target_type: 'insect', resistance_risk: 'low' },
      { classification_system: 'IRAC', moa_code: '6', moa_name_th: 'อะแบคติน/เอมาเมคติน (Avermectins)', moa_name_en: 'Avermectins', mechanism_of_action: 'กระตุ้นช่อง Chloride', target_type: 'insect', resistance_risk: 'medium' },
      { classification_system: 'IRAC', moa_code: '28', moa_name_th: 'ไดอะไมด์ (Diamides)', moa_name_en: 'Diamides', mechanism_of_action: 'ยับยั้งตัวรับ Ryanodine', target_type: 'insect', resistance_risk: 'low' }
    ];

    const fracGroups = [
      { classification_system: 'FRAC', moa_code: '1', moa_name_th: 'เบนซิมิดาโซล (MBC)', moa_name_en: 'MBC', mechanism_of_action: 'ยับยั้งการสร้าง Beta-tubulin', target_type: 'fungus', resistance_risk: 'high' },
      { classification_system: 'FRAC', moa_code: '3', moa_name_th: 'ยับยั้งการสังเคราะห์สเตอรอล (DMI)', moa_name_en: 'DMI', mechanism_of_action: 'ยับยั้ง C14-demethylase', target_type: 'fungus', resistance_risk: 'medium' },
      { classification_system: 'FRAC', moa_code: '7', moa_name_th: 'ยับยั้ง Succinate dehydrogenase (SDHI)', moa_name_en: 'SDHI', mechanism_of_action: 'ยับยั้งการหายใจ Complex II', target_type: 'fungus', resistance_risk: 'medium' },
      { classification_system: 'FRAC', moa_code: '11', moa_name_th: 'สไตรบิลูริน (QoI)', moa_name_en: 'QoI', mechanism_of_action: 'ยับยั้งการหายใจ Complex III', target_type: 'fungus', resistance_risk: 'high' },
      { classification_system: 'FRAC', moa_code: 'M', moa_name_th: 'Multi-site activity', moa_name_en: 'Multi-site', mechanism_of_action: 'ทำลายหลายจุดในเซลล์', target_type: 'fungus', resistance_risk: 'low' }
    ];

    const moaIds = {};
    for (const moa of [...iracGroups, ...fracGroups]) {
      const id = await upsertMoAGroup(moa);
      moaIds[`${moa.classification_system}_${moa.moa_code}`] = id;
      console.log(`  ✓ ${moa.moa_code} - ${moa.moa_name_th}`);
    }

    /* ================= TARGETS ================= */
    console.log('\n🐛 Adding Pests/Diseases...');

    const targets = [
      { target_name_th: 'เพลี้ยไฟ', target_name_en: 'Thrips', scientific_name: 'Thysanoptera', target_type: 'insect', insect_category: 'sucking', description: 'แมลงขนาดเล็กทำลายใบและดอก' },
      { target_name_th: 'เพลี้ยอ่อน', target_name_en: 'Aphids', scientific_name: 'Aphididae', target_type: 'insect', insect_category: 'sucking', description: 'แมลงดูดน้ำเลี้ยงพืช' },
      { target_name_th: 'หนอนเจาะผล', target_name_en: 'Fruit borer', scientific_name: 'Conopomorpha sinensis', target_type: 'insect', insect_category: 'boring', description: 'หนอนเจาะทำลายผล' },
      { target_name_th: 'เพลี้ยจักจั่น', target_name_en: 'Leafhopper', scientific_name: 'Cicadellidae', target_type: 'insect', insect_category: 'sucking', description: 'แมลงดูดน้ำเลี้ยงและพาหะโรค' },
      { target_name_th: 'หนอนกระทู้ข้าวโพด', target_name_en: 'Fall Armyworm', scientific_name: 'Spodoptera frugiperda', target_type: 'insect', insect_category: 'chewing', description: 'หนอนกินใบและลำต้น' },
      { target_name_th: 'โรคแอนแทรคโนส', target_name_en: 'Anthracnose', scientific_name: 'Colletotrichum spp.', target_type: 'fungus', insect_category: null, description: 'โรคราสาเหตุจุดดำบนผล' }
    ];

    const targetIds = {};
    for (const t of targets) {
      const id = await upsertTarget(t);
      targetIds[t.target_name_en] = id;
      console.log(`  ✓ ${t.target_name_th} (${t.target_name_en})`);
    }

    /* ================= CROPS ================= */
    console.log('\n🌾 Adding Crops...');

    const crops = [
      { crop_name_th: 'มะม่วง', crop_name_en: 'Mango', scientific_name: 'Mangifera indica', crop_type: 'fruit', description: 'ไม้ผลเขตร้อน' },
      { crop_name_th: 'มะนาว', crop_name_en: 'Lime', scientific_name: 'Citrus aurantifolia', crop_type: 'fruit', description: 'ไม้ผลตระกูลส้ม' },
      { crop_name_th: 'ข้าวโพด', crop_name_en: 'Corn', scientific_name: 'Zea mays', crop_type: 'cereal', description: 'พืชเศรษฐกิจ' }
    ];

    const cropIds = {};
    for (const crop of crops) {
      const id = await upsertCrop(crop);
      cropIds[crop.crop_name_en] = id;
      console.log(`  ✓ ${crop.crop_name_th} (${crop.crop_name_en})`);
    }

    /* ================= PRODUCTS ================= */
    console.log('\n💊 Adding Products (Pesticides)...');

    const products = [
      // IRAC 4A - Neonicotinoids
      { product_name: 'อิมิดาคลอพริด 20% SL', manufacturer: 'เคมีภัณฑ์', product_type: 'insecticide', registration_number: 'ส.ข.001/24', active_ingredient: 'Imidacloprid', concentration: '20%', formulation: 'SL', moa_group_id: moaIds['IRAC_4A'], recommended_rate_min: 20, recommended_rate_max: 40, rate_unit: 'ml/20L', phi_days: 7, safety_interval: 3 },
      { product_name: 'ไทอะมีท็อกแซม 25% WG', manufacturer: 'ซินเจนทา', product_type: 'insecticide', registration_number: 'ส.ข.002/24', active_ingredient: 'Thiamethoxam', concentration: '25%', formulation: 'WG', moa_group_id: moaIds['IRAC_4A'], recommended_rate_min: 8, recommended_rate_max: 12, rate_unit: 'g/20L', phi_days: 7, safety_interval: 3 },
      { product_name: 'อะซีตามิพริด 20% SP', manufacturer: 'นิปปอน', product_type: 'insecticide', registration_number: 'ส.ข.003/24', active_ingredient: 'Acetamiprid', concentration: '20%', formulation: 'SP', moa_group_id: moaIds['IRAC_4A'], recommended_rate_min: 10, recommended_rate_max: 15, rate_unit: 'g/20L', phi_days: 7, safety_interval: 3 },
      
      // IRAC 3A - Pyrethroids
      { product_name: 'ไซเพอร์เมทริน 10% EC', manufacturer: 'FMC', product_type: 'insecticide', registration_number: 'ส.ข.004/24', active_ingredient: 'Cypermethrin', concentration: '10%', formulation: 'EC', moa_group_id: moaIds['IRAC_3A'], recommended_rate_min: 30, recommended_rate_max: 50, rate_unit: 'ml/20L', phi_days: 3, safety_interval: 2 },
      { product_name: 'เดลตาเมทริน 2.5% EC', manufacturer: 'บาเยอร์', product_type: 'insecticide', registration_number: 'ส.ข.005/24', active_ingredient: 'Deltamethrin', concentration: '2.5%', formulation: 'EC', moa_group_id: moaIds['IRAC_3A'], recommended_rate_min: 40, recommended_rate_max: 60, rate_unit: 'ml/20L', phi_days: 3, safety_interval: 2 },
      { product_name: 'เพอร์เมทริน 25% EC', manufacturer: 'ดาว', product_type: 'insecticide', registration_number: 'ส.ข.006/24', active_ingredient: 'Permethrin', concentration: '25%', formulation: 'EC', moa_group_id: moaIds['IRAC_3A'], recommended_rate_min: 30, recommended_rate_max: 50, rate_unit: 'ml/20L', phi_days: 3, safety_interval: 2 },
      
      // IRAC 5 - Spinosyns
      { product_name: 'สปิโนแซด 24% SC', manufacturer: 'ดาว', product_type: 'insecticide', registration_number: 'ส.ข.007/24', active_ingredient: 'Spinosad', concentration: '24%', formulation: 'SC', moa_group_id: moaIds['IRAC_5'], recommended_rate_min: 15, recommended_rate_max: 25, rate_unit: 'ml/20L', phi_days: 1, safety_interval: 1 },
      
      // IRAC 28 - Diamides
      { product_name: 'คลอแรนทราลินิพรอล 20% SC', manufacturer: 'FMC', product_type: 'insecticide', registration_number: 'ส.ข.008/24', active_ingredient: 'Chlorantraniliprole', concentration: '20%', formulation: 'SC', moa_group_id: moaIds['IRAC_28'], recommended_rate_min: 10, recommended_rate_max: 20, rate_unit: 'ml/20L', phi_days: 1, safety_interval: 1 },
      { product_name: 'ไซแอนทราลินิพรอล 10% OD', manufacturer: 'ดูปองท์', product_type: 'insecticide', registration_number: 'ส.ข.009/24', active_ingredient: 'Cyantraniliprole', concentration: '10%', formulation: 'OD', moa_group_id: moaIds['IRAC_28'], recommended_rate_min: 20, recommended_rate_max: 30, rate_unit: 'ml/20L', phi_days: 1, safety_interval: 1 },
      
      // IRAC 6 - Avermectins
      { product_name: 'อะแบคติน 1.8% EC', manufacturer: 'ซินเจนทา', product_type: 'insecticide', registration_number: 'ส.ข.010/24', active_ingredient: 'Abamectin', concentration: '1.8%', formulation: 'EC', moa_group_id: moaIds['IRAC_6'], recommended_rate_min: 25, recommended_rate_max: 40, rate_unit: 'ml/20L', phi_days: 7, safety_interval: 3 },
      { product_name: 'เอมาเมคติน เบนโซเอต 5% SG', manufacturer: 'ซินเจนทา', product_type: 'insecticide', registration_number: 'ส.ข.011/24', active_ingredient: 'Emamectin benzoate', concentration: '5%', formulation: 'SG', moa_group_id: moaIds['IRAC_6'], recommended_rate_min: 5, recommended_rate_max: 10, rate_unit: 'g/20L', phi_days: 7, safety_interval: 3 },
      
      // IRAC 1B - Organophosphates
      { product_name: 'คลอร์ไพริฟอส 40% EC', manufacturer: 'ดาว', product_type: 'insecticide', registration_number: 'ส.ข.012/24', active_ingredient: 'Chlorpyrifos', concentration: '40%', formulation: 'EC', moa_group_id: moaIds['IRAC_1B'], recommended_rate_min: 40, recommended_rate_max: 60, rate_unit: 'ml/20L', phi_days: 14, safety_interval: 7 },
      { product_name: 'ไดอะซินอน 60% EC', manufacturer: 'มาการอน', product_type: 'insecticide', registration_number: 'ส.ข.013/24', active_ingredient: 'Diazinon', concentration: '60%', formulation: 'EC', moa_group_id: moaIds['IRAC_1B'], recommended_rate_min: 30, recommended_rate_max: 50, rate_unit: 'ml/20L', phi_days: 14, safety_interval: 7 },
      
      // IRAC 1A - Carbamates
      { product_name: 'คาร์บาริล 85% WP', manufacturer: 'บาซฟ', product_type: 'insecticide', registration_number: 'ส.ข.014/24', active_ingredient: 'Carbaryl', concentration: '85%', formulation: 'WP', moa_group_id: moaIds['IRAC_1A'], recommended_rate_min: 30, recommended_rate_max: 50, rate_unit: 'g/20L', phi_days: 7, safety_interval: 3 },
      
      // FRAC 3 - DMI Fungicides
      { product_name: 'โพรพิโคนาโซล 25% EC', manufacturer: 'ซินเจนทา', product_type: 'fungicide', registration_number: 'ส.ร.001/24', active_ingredient: 'Propiconazole', concentration: '25%', formulation: 'EC', moa_group_id: moaIds['FRAC_3'], recommended_rate_min: 20, recommended_rate_max: 30, rate_unit: 'ml/20L', phi_days: 7, safety_interval: 3 },
      { product_name: 'เตบูโคนาโซล 25% EW', manufacturer: 'บาเยอร์', product_type: 'fungicide', registration_number: 'ส.ร.002/24', active_ingredient: 'Tebuconazole', concentration: '25%', formulation: 'EW', moa_group_id: moaIds['FRAC_3'], recommended_rate_min: 20, recommended_rate_max: 30, rate_unit: 'ml/20L', phi_days: 7, safety_interval: 3 },
      { product_name: 'ไดฟีโนโคนาโซล 25% EC', manufacturer: 'ซินเจนทา', product_type: 'fungicide', registration_number: 'ส.ร.003/24', active_ingredient: 'Difenoconazole', concentration: '25%', formulation: 'EC', moa_group_id: moaIds['FRAC_3'], recommended_rate_min: 15, recommended_rate_max: 25, rate_unit: 'ml/20L', phi_days: 7, safety_interval: 3 },
      
      // FRAC 11 - Strobilurins
      { product_name: 'อะซอกซีสโทรบิน 25% SC', manufacturer: 'ซินเจนทา', product_type: 'fungicide', registration_number: 'ส.ร.004/24', active_ingredient: 'Azoxystrobin', concentration: '25%', formulation: 'SC', moa_group_id: moaIds['FRAC_11'], recommended_rate_min: 15, recommended_rate_max: 25, rate_unit: 'ml/20L', phi_days: 3, safety_interval: 2 },
      { product_name: 'ไตรฟล็อกซีสโทรบิน 50% WG', manufacturer: 'บาเยอร์', product_type: 'fungicide', registration_number: 'ส.ร.005/24', active_ingredient: 'Trifloxystrobin', concentration: '50%', formulation: 'WG', moa_group_id: moaIds['FRAC_11'], recommended_rate_min: 10, recommended_rate_max: 15, rate_unit: 'g/20L', phi_days: 3, safety_interval: 2 },
      
      // FRAC M - Multi-site
      { product_name: 'แมนโคเซบ 80% WP', manufacturer: 'UPL', product_type: 'fungicide', registration_number: 'ส.ร.006/24', active_ingredient: 'Mancozeb', concentration: '80%', formulation: 'WP', moa_group_id: moaIds['FRAC_M'], recommended_rate_min: 30, recommended_rate_max: 50, rate_unit: 'g/20L', phi_days: 7, safety_interval: 3 },
      { product_name: 'คลอโรทาโลนิล 75% WP', manufacturer: 'ซินเจนทา', product_type: 'fungicide', registration_number: 'ส.ร.007/24', active_ingredient: 'Chlorothalonil', concentration: '75%', formulation: 'WP', moa_group_id: moaIds['FRAC_M'], recommended_rate_min: 30, recommended_rate_max: 40, rate_unit: 'g/20L', phi_days: 7, safety_interval: 3 },
      { product_name: 'คอปเปอร์ออกซี่คลอไรด์ 85% WP', manufacturer: 'เอเวอร์กรีน', product_type: 'fungicide', registration_number: 'ส.ร.008/24', active_ingredient: 'Copper oxychloride', concentration: '85%', formulation: 'WP', moa_group_id: moaIds['FRAC_M'], recommended_rate_min: 40, recommended_rate_max: 60, rate_unit: 'g/20L', phi_days: 7, safety_interval: 3 },
      
      // FRAC 1 - MBC
      { product_name: 'คาร์เบนดาซิม 50% WP', manufacturer: 'บาซฟ', product_type: 'fungicide', registration_number: 'ส.ร.009/24', active_ingredient: 'Carbendazim', concentration: '50%', formulation: 'WP', moa_group_id: moaIds['FRAC_1'], recommended_rate_min: 20, recommended_rate_max: 30, rate_unit: 'g/20L', phi_days: 7, safety_interval: 3 },
      
      // FRAC 7 - SDHI
      { product_name: 'บอสคาลิด 25% WG', manufacturer: 'บาซฟ', product_type: 'fungicide', registration_number: 'ส.ร.010/24', active_ingredient: 'Boscalid', concentration: '25%', formulation: 'WG', moa_group_id: moaIds['FRAC_7'], recommended_rate_min: 15, recommended_rate_max: 25, rate_unit: 'g/20L', phi_days: 3, safety_interval: 2 }
    ];

    const productIds = {};
    for (const p of products) {
      const existing = await DB.getAllProducts();
      const found = existing.find(prod => prod.product_name === p.product_name);
      if (!found) {
        const id = await DB.createProduct(p);
        productIds[p.product_name] = id;
        console.log(`  ✓ ${p.product_name}`);
      } else {
        productIds[p.product_name] = found.product_id;
      }
    }

    /* ================= PRODUCT-TARGET LINKS ================= */
    console.log('\n🔗 Linking Products to Targets...');

    const links = [
      // Thrips
      { product: 'อิมิดาคลอพริด 20% SL', target: 'Thrips', efficacy: 5 },
      { product: 'ไทอะมีท็อกแซม 25% WG', target: 'Thrips', efficacy: 5 },
      { product: 'อะซีตามิพริด 20% SP', target: 'Thrips', efficacy: 5 },
      { product: 'สปิโนแซด 24% SC', target: 'Thrips', efficacy: 4 },
      { product: 'อะแบคติน 1.8% EC', target: 'Thrips', efficacy: 4 },
      
      // Aphids
      { product: 'อิมิดาคลอพริด 20% SL', target: 'Aphids', efficacy: 5 },
      { product: 'ไทอะมีท็อกแซม 25% WG', target: 'Aphids', efficacy: 5 },
      { product: 'อะซีตามิพริด 20% SP', target: 'Aphids', efficacy: 5 },
      { product: 'ไซเพอร์เมทริน 10% EC', target: 'Aphids', efficacy: 3 },
      { product: 'คลอร์ไพริฟอส 40% EC', target: 'Aphids', efficacy: 4 },
      
      // Fruit borer
      { product: 'คลอแรนทราลินิพรอล 20% SC', target: 'Fruit borer', efficacy: 5 },
      { product: 'ไซแอนทราลินิพรอล 10% OD', target: 'Fruit borer', efficacy: 5 },
      { product: 'เอมาเมคติน เบนโซเอต 5% SG', target: 'Fruit borer', efficacy: 5 },
      { product: 'สปิโนแซด 24% SC', target: 'Fruit borer', efficacy: 4 },
      { product: 'อะแบคติน 1.8% EC', target: 'Fruit borer', efficacy: 4 },
      
      // Fall Armyworm
      { product: 'คลอแรนทราลินิพรอล 20% SC', target: 'Fall Armyworm', efficacy: 5 },
      { product: 'เอมาเมคติน เบนโซเอต 5% SG', target: 'Fall Armyworm', efficacy: 5 },
      { product: 'สปิโนแซด 24% SC', target: 'Fall Armyworm', efficacy: 4 },
      
      // Anthracnose
      { product: 'โพรพิโคนาโซล 25% EC', target: 'Anthracnose', efficacy: 5 },
      { product: 'เตบูโคนาโซล 25% EW', target: 'Anthracnose', efficacy: 5 },
      { product: 'ไดฟีโนโคนาโซล 25% EC', target: 'Anthracnose', efficacy: 5 },
      { product: 'อะซอกซีสโทรบิน 25% SC', target: 'Anthracnose', efficacy: 4 },
      { product: 'แมนโคเซบ 80% WP', target: 'Anthracnose', efficacy: 4 },
      { product: 'คลอโรทาโลนิล 75% WP', target: 'Anthracnose', efficacy: 4 }
    ];

    for (const link of links) {
      const pId = productIds[link.product];
      const tId = targetIds[link.target];
      if (pId && tId) {
        try {
          await DB.linkProductToTarget(pId, tId, link.efficacy, null);
          console.log(`  ✓ ${link.product} → ${link.target} (${link.efficacy}★)`);
        } catch (err) {
          if (!err.message.includes('UNIQUE')) console.warn(`  ⚠ ${err.message}`);
        }
      }
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   MoA Groups: ${Object.keys(moaIds).length}`);
    console.log(`   Targets: ${Object.keys(targetIds).length}`);
    console.log(`   Crops: ${Object.keys(cropIds).length}`);
    console.log(`   Products: ${Object.keys(productIds).length}`);
    console.log(`   Links: ${links.length}`);
    
    return { success: true };

  } catch (err) {
    console.error('\n❌ Seeding failed:', err);
    return { success: false, message: err.message };
  }
};