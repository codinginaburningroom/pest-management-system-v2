require('dotenv').config();
const db = require('../config/database');

const seedData = async () => {
  const connection = await db.getConnection();

  try {
    console.log('🌱 Starting data seeding...\n');

    await connection.beginTransaction();

    // ===============================
    // CLEAR DATABASE
    // ===============================
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE plots');
    await connection.query('TRUNCATE TABLE farms');
    await connection.query('TRUNCATE TABLE products');
    await connection.query('TRUNCATE TABLE crop_stages');
    await connection.query('TRUNCATE TABLE crops');
    await connection.query('TRUNCATE TABLE targets');
    await connection.query('TRUNCATE TABLE moa_groups');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('🧹 Database cleared.\n');

    // ===============================
    // 1. MoA GROUPS
    // ===============================
    console.log('📋 Adding MoA Groups...');

    const moaGroups = [
      ['IRAC','4A','นีโอนิโคตินอยด์','Neonicotinoids','ตัวรับของอะเซทิลโคลีน','insect','medium'],
      ['IRAC','3A','ไพรีทรอยด์','Pyrethroids','ช่องโซเดียมในเซลล์ประสาท','insect','high'],
      ['IRAC','28','ไดอะไมด์','Diamides','ตัวรับ Ryanodine','insect','low'],
      ['IRAC','1B','ออร์กาโนฟอสเฟต','Organophosphates','ยับยั้ง Acetylcholinesterase','insect','medium'],
      ['IRAC','6','อะเวอร์เมคติน','Avermectins','ช่องคลอไรด์ควบคุมด้วย Glutamate','insect','low'],
      ['FRAC','3','DMI','DMI Fungicides','ยับยั้งการสร้าง Ergosterol','disease','medium'],
      ['FRAC','11','QoI','Strobilurins','ยับยั้ง Respiration (Complex III)','disease','high'],
      ['FRAC','7','SDHI','Succinate Dehydrogenase Inhibitors','ยับยั้ง Respiration (Complex II)','disease','medium'],
      ['FRAC','M','มัลติไซต์','Multi-site Contact','หลายจุดทำงาน','disease','low'],
      ['HRAC','B','กลุ่ม B','ALS Inhibitors','ยับยั้ง Acetolactate Synthase','weed','high'],
      ['HRAC','G','กลุ่ม G','EPSPS Inhibitors','ยับยั้ง EPSP Synthase','weed','medium']
    ];

    for (const row of moaGroups) {
      await connection.query(`
        INSERT INTO moa_groups
        (classification_system, moa_code, moa_name_th, moa_name_en,
         mechanism_of_action, target_type, resistance_risk)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, row);
      console.log(`  ✓ ${row[1]} - ${row[2]}`);
    }

    // ===============================
    // 2. TARGETS
    // ===============================
    console.log('\n🐛 Adding Targets...');

    const targets = [
      // INSECTS
      ['เพลี้ยไฟ','Thrips','Thysanoptera spp.','insect','sucking','ดูดกินน้ำเลี้ยง'],
      ['เพลี้ยอ่อน','Aphids','Aphididae','insect','sucking','ดูดยอดอ่อน'],
      ['เพลี้ยแป้ง','Mealybugs','Pseudococcidae','insect','sucking','ขับน้ำหวาน'],
      ['เพลี้ยหอย','Scale insects','Coccoidea','insect','sucking','ดูดกิ่ง'],
      ['หนอนเจาะผล','Fruit borer','Conopomorpha cramerella','insect','boring','เจาะผล'],
      ['หนอนเจาะสมอฝ้าย','Cotton bollworm','Helicoverpa armigera','insect','boring','ทำลายดอก'],
      ['ด้วงหนวดยาว','Longhorn beetle','Batocera rufomaculata','insect','boring','เจาะลำต้น'],
      ['หนอนใยผัก','Diamondback moth','Plutella xylostella','insect','chewing','กัดใบ'],
      ['ด้วงเต่า','Tortoise beetle','Cassidinae','insect','chewing','กัดใบ'],

      // DISEASES (insect_category = NULL)
      ['โรคแอนแทรคโนส','Anthracnose','Colletotrichum spp.','disease',null,'จุดสีน้ำตาล'],
      ['โรคใบจุด','Leaf spot','Cercospora spp.','disease',null,'ใบแห้ง'],
      ['โรคราแป้ง','Powdery mildew','Oidium spp.','disease',null,'ผงขาว'],
      ['โรคราดำ','Sooty mold','Capnodium spp.','disease',null,'ใบดำ'],
      ['โรครากเน่า','Root rot','Phytophthora spp.','disease',null,'รากเน่า'],
      ['โรคแบคทีเรียใบไหม้','Bacterial blight','Xanthomonas spp.','disease',null,'ใบไหม้'],

      // WEEDS (insect_category = NULL)
      ['หญ้าคา','Crabgrass','Digitaria spp.','weed',null,'วัชพืชหญ้า'],
      ['ผักบุ้งน้อย','Water spinach weed','Ipomoea aquatica','weed',null,'ใบกว้าง'],
      ['แห้วหมู','Pig weed','Amaranthus spp.','weed',null,'โตเร็ว']
    ];

    for (const row of targets) {
      await connection.query(`
        INSERT INTO targets
        (target_name_th, target_name_en, scientific_name,
         target_type, insect_category, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `, row);
      console.log(`  ✓ ${row[0]}`);
    }

    // ===============================
    // 3. CROPS
    // ===============================
    console.log('\n🌾 Adding Crops...');

    const crops = [
      ['มะม่วง','Mango','Mangifera indica','fruit','ผลไม้เศรษฐกิจ'],
      ['มะนาว','Lime','Citrus aurantifolia','fruit','ให้รสเปรี้ยว'],
      ['ทุเรียน','Durian','Durio zibethinus','fruit','ผลไม้ยอดนิยม'],
      ['ลำไย','Longan','Dimocarpus longan','fruit','รสหวาน'],
      ['กล้วย','Banana','Musa spp.','fruit','ปลูกง่าย'],
      ['มะเขือเทศ','Tomato','Solanum lycopersicum','vegetable','ผักผล'],
      ['พริก','Chili','Capsicum annuum','vegetable','เครื่องเทศ'],
      ['ผักกาดหอม','Lettuce','Lactuca sativa','vegetable','ผักสลัด'],
      ['คะน้า','Chinese kale','Brassica oleracea','vegetable','ผักใบ'],
      ['ข้าวเจ้า','Rice','Oryza sativa','grain','ธัญพืชหลัก'],
      ['ข้าวโพด','Corn','Zea mays','grain','ธัญพืชเศรษฐกิจ']
    ];

    for (const row of crops) {
      await connection.query(`
        INSERT INTO crops
        (crop_name_th, crop_name_en, scientific_name,
         crop_type, description)
        VALUES (?, ?, ?, ?, ?)
      `, row);
      console.log(`  ✓ ${row[0]}`);
    }

    await connection.commit();

    console.log('\n✅ Seeding completed successfully!\n');

    connection.release();
    process.exit(0);

  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error('\n❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
