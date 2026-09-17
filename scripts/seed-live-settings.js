const { pool } = require('../config/db');

const defaults = {
  site_name: 'Drodul Phendey Ling Foundation',
  tibetan_title: '༄༅། །དྲོ་བདུལ་ཕན་བདེ་གླིང་དགོན་པ།',
  site_tagline: 'Building Peace. Empowering Lives.',
  header_phone: '+975 17556559',
  header_email: 'contact@drodulphendeyling.org',
  header_location: 'Gelephu, Sarpang, Bhutan',
  header_announcement: '☸ Welcoming Devotees to the Historic 108ft Great Druk Wangyel Peace Stupa • 80G Tax Exemption Available',
  header_announcement_on: 'true',
  home_hero_title: 'Sacred Dharma Sanctuary & 108ft Peace Stupa',
  home_hero_subtitle: 'Dedicated to the preservation of sacred Vajrayana Buddhist heritage, monastic higher education, and universal world peace in the foothills of Gelephu, Bhutan.',
  home_hero_image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1800&q=85',
  home_hero_cta_text: 'Offer Dana',
  home_hero_cta_link: '/donate',
  home_about_title: 'The Sacred Mandate of Drodul Phendey Ling',
  home_about_description: 'Founded under the spiritual patronage of venerable masters, our monastery serves as a beacon of Vajrayana wisdom, sheltering over 350 monks and leading humanitarian projects.',
  about_page_title: 'About Drodul Phendey Ling Foundation',
  about_page_subtitle: 'Established in the tranquil Himalayan foothills of Gelephu, Sarpang Dzongkhag, Bhutan, to nurture authentic Buddha Dharma, train monk scholars, and build the historic 108ft Great Druk Wangyel Peace Stupa.',
  about_pillar_1_title: 'Sacred Lineage & Vision',
  about_pillar_1_desc: 'Rooted in authentic Vajrayana and Mahayana traditions, our mission is to cultivate universal compassion, wisdom, and an enlightened sanctuary where monastic and lay practitioners realize inner peace.',
  about_pillar_2_title: 'Shedra Monastic University',
  about_pillar_2_desc: 'Providing 350+ enrolled monks with full residential scholarships, classical Tibetan linguistics, Abhidharma, Madhyamaka philosophy, debate epistemics, and contemplative solitary retreats.',
  about_pillar_3_title: 'Great Peace Stupa',
  about_pillar_3_desc: 'The monumental 108-foot Great Druk Wangyel Peace Stupa serves as a beacon of harmony, housing sacred relic chambers, 108 stone-carved prayer wheels, and pacifying discord for all beings.',
  about_leader_name: 'H.E. Khenpo Karma Rinpoche',
  about_leader_title: 'Abbot & Spiritual Director',
  about_leader_bio: 'A distinguished scholar of Nalanda philosophy and Dzogchen meditation with over 35 years of teaching across Bhutan, India, and the international Buddhist community.',
  about_history_text: 'Conceived in 2008 as a humble meditation retreat hermitage, Drodul Phendey Ling has blossomed into one of southern Bhutan’s foremost centers for Buddhist learning, monk training, and humanitarian relief.',
  contact_address: 'Great Druk Wangyel Peace Stupa Complex, Gelephu, Sarpang Dzongkhag, Kingdom of Bhutan',
  contact_phone: '+975 17556559',
  contact_email: 'contact@drodulphendeyling.org',
  contact_hours: 'Mon - Sat: 08:00 AM - 05:00 PM BST (Bhutan Standard Time)',
  contact_map_url: 'https://maps.google.com',
  donate_hero_title: 'Offer Dana • Accumulate Merit for All Beings',
  donate_hero_subtitle: 'Your sacred generosity directly provides daily nutritious meals, monastic robing, classical Dharma textbooks, and medical care for 350+ young monks, and constructs the 108ft Great Peace Stupa.',
  donation_preset_amounts: '500, 1100, 2100, 5100, 11000',
  donation_default_amount: '1100',
  bank_name: 'Bank of Bhutan (BoB)',
  bank_account_name: 'Drodul Phendey Ling Foundation',
  bank_account_no: '200847291038',
  bank_swift_code: 'BHUBBTBT',
  bank_branch: 'Gelephu Main Branch',
  tax_exempt_reg: 'DPL/TAX-EXEMPT/BTN/2026/80G-092',
  tax_80g_order_no: 'CIT(E)/THIMPHU/80G/2026-27/AAATD1234F',
  footer_copyright: '© 2026 Drodul Phendey Ling Foundation. All rights reserved. Registered Religious & Charitable Trust, Kingdom of Bhutan.',
  social_facebook: 'https://facebook.com',
  social_instagram: 'https://instagram.com',
  social_youtube: 'https://youtube.com'
};

async function seed() {
  for (const [k, v] of Object.entries(defaults)) {
    await pool.query(
      `INSERT INTO system_settings (setting_key, setting_value) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE setting_value = IF(setting_value IS NULL OR setting_value = '', VALUES(setting_value), setting_value)`,
      [k, v]
    );
  }
  const [count] = await pool.query('SELECT COUNT(*) as c FROM system_settings');
  console.log('Seeded successfully! Total settings in DB:', count[0].c);
  process.exit(0);
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
