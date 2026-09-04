const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const { testConnection } = require('./config/db');
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Body Parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded media / certificates / receipts statically
app.use('/uploads', express.static(uploadDir));

// Mount REST API Router
app.use('/api', apiRouter);

// Serve Frontend Static Build (when compiled into dist/)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA Fallback for client-side routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Drodul Phendey Ling Foundation API Server is running.',
      frontendStatus: 'Run `npm run build` to build and serve the React frontend through this server, or run `npm run dev` for Vite dev server.',
      apiDocs: '/api/settings'
    });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Auto-sync verified Bhutan & Thimphu Monastic Media Assets
async function autoMigrateBhutanAssets() {
  try {
    const { pool } = require('./config/db');
    // 1. Update Campaigns
    await pool.query(`UPDATE campaigns SET banner_image = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80' WHERE id = 1`);
    await pool.query(`UPDATE campaigns SET banner_image = 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80' WHERE id = 2`);
    await pool.query(`UPDATE campaigns SET banner_image = 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1200&q=80' WHERE id = 3`);
    await pool.query(`UPDATE campaigns SET banner_image = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80' WHERE id = 4`);

    // 2. Update News & Events
    await pool.query(`UPDATE news_events SET banner_image = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80' WHERE id = 1`);
    await pool.query(`UPDATE news_events SET banner_image = 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80' WHERE id = 2`);
    await pool.query(`UPDATE news_events SET banner_image = 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?auto=format&fit=crop&w=1200&q=80' WHERE id = 3`);
    await pool.query(`UPDATE news_events SET banner_image = 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80' WHERE id = 4`);

    // 3. Update Blog Posts
    await pool.query(`UPDATE blog_posts SET cover_image = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80' WHERE id = 1`);
    await pool.query(`UPDATE blog_posts SET cover_image = 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80' WHERE id = 2`);
    await pool.query(`UPDATE blog_posts SET cover_image = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80' WHERE id = 3`);

    // 4. Update Learning Videos
    await pool.query(`UPDATE learning_materials SET thumbnail_url = 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80' WHERE id = 1`);
    await pool.query(`UPDATE learning_materials SET thumbnail_url = 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?auto=format&fit=crop&w=1200&q=80' WHERE id = 2`);
    await pool.query(`UPDATE learning_materials SET thumbnail_url = 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80' WHERE id = 3`);
    await pool.query(`UPDATE learning_materials SET thumbnail_url = 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1200&q=80' WHERE id = 4`);

    // 5. Update Gallery Items
    await pool.query(`UPDATE gallery_items SET media_url = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80', thumbnail_url = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80' WHERE id = 1`);
    await pool.query(`UPDATE gallery_items SET media_url = 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80', thumbnail_url = 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=400&q=80' WHERE id = 2`);
    await pool.query(`UPDATE gallery_items SET thumbnail_url = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80' WHERE id = 3`);
    await pool.query(`UPDATE gallery_items SET media_url = 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80', thumbnail_url = 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80' WHERE id = 4`);
    await pool.query(`UPDATE gallery_items SET thumbnail_url = 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=400&q=80' WHERE id = 5`);

    // 6. Ensure Students & Monks baseline data exists
    const [monkRows] = await pool.query(`SELECT COUNT(*) as count FROM students_monks`);
    if (monkRows[0].count === 0) {
      await pool.query(`
        INSERT INTO students_monks (id, monastic_name, secular_name, roll_number, sangha_id, gender, nationality, joining_date, monk_status, guardian_name, guardian_phone, address, status) VALUES
        (1, 'Tenzin Norbu', 'Norbu Wangchuk', 'MNK-2026-001', 'SANGHA-GLP-101', 'male', 'Bhutanese', '2024-01-10', 'novice', 'Karma Wangchuk', '+975 17443322', 'Sarpang Dzongkhag, Bhutan', 'enrolled'),
        (2, 'Pema Gyaltsen', 'Gyaltsen Dorji', 'MNK-2026-002', 'SANGHA-GLP-102', 'male', 'Bhutanese', '2023-02-15', 'gelong', 'Sonam Dorji', '+975 17221144', 'Mongar, Bhutan', 'enrolled'),
        (3, 'Ngawang Choden', 'Choden Lhamo', 'STU-2026-003', 'SANGHA-GLP-103', 'female', 'Bhutanese', '2025-03-01', 'lay_student', 'Sangay Lhamo', '+975 17334411', 'Gelephu Town', 'enrolled'),
        (4, 'Sangay Thinley', 'Thinley Penjor', 'MNK-2026-004', 'SANGHA-GLP-104', 'male', 'Bhutanese', '2022-01-10', 'khenpo', 'Self', '+975 17665511', 'Punakha, Bhutan', 'enrolled')
      `);
    }

    // 7. Ensure Courses & Enrollments baseline data exists
    const [crsRows] = await pool.query(`SELECT COUNT(*) as count FROM courses`);
    if (crsRows[0].count === 0) {
      await pool.query(`
        INSERT INTO courses (id, course_code, title, slug, level, description, duration_months, total_credits, instructor_name, fee_amount, currency, is_active) VALUES
        (1, 'CRS-101', 'Buddhist Philosophy - Level 1', 'buddhist-philosophy-level-1', 'Basic', 'Introduction to Abhidharma, Four Noble Truths, and Eightfold Path.', 6, 12, 'Khenpo Tashi Dorji', 0.00, 'INR', 1),
        (2, 'CRS-102', 'Meditation & Mindfulness', 'meditation-mindfulness', 'Basic', 'Core practices of Shamatha and Vipassana meditation.', 3, 8, 'Lopen Karma Samten', 0.00, 'INR', 1),
        (3, 'CRS-103', 'Tibetan Language Basic', 'tibetan-language-basic', 'Basic', 'Study of Uchen script, classical Tibetan grammar, and liturgy.', 6, 12, 'Lopen Sonam Rigzin', 0.00, 'INR', 1),
        (4, 'CRS-104', 'Buddha Dharma Studies', 'buddha-dharma-studies', 'Intermediate', 'Study of Shantideva Bodhisattvacharyavatara and Six Paramitas.', 6, 14, 'Khenpo Jigme Wangdi', 0.00, 'INR', 1)
      `);
      await pool.query(`
        INSERT INTO enrollments (id, student_id, course_id, batch_id, enrollment_date, progress_percent, attendance_percent, grade, status, certificate_issued) VALUES
        (1, 1, 1, NULL, '2026-03-01', 75, 96, 'A', 'in_progress', 0),
        (2, 1, 2, NULL, '2026-06-01', 80, 92, 'A+', 'in_progress', 0),
        (3, 2, 1, NULL, '2026-03-01', 85, 98, 'A+', 'in_progress', 0),
        (4, 2, 4, NULL, '2026-01-01', 100, 98, 'Distinction', 'completed', 1)
      `);
    }

    // 8. Ensure Store Items baseline exists
    const [itmRows] = await pool.query(`SELECT COUNT(*) as count FROM store_items`);
    if (itmRows[0].count === 0) {
      await pool.query(`
        INSERT INTO store_items (id, item_code, item_name, category_id, unit_id, current_stock, min_stock, unit_cost, location_id, description, status) VALUES
        (1, 'ITM-00125', 'Butter Lamp (Small Brass)', 2, 1, 18, 50, 45.00, 1, 'Traditional brass butter lamp for altar offering', 'low_stock'),
        (2, 'ITM-00098', 'Torma Roasted Flour', 3, 2, 12, 25, 120.00, 2, 'Special consecrated flour for torma sculptures', 'low_stock'),
        (3, 'ITM-00077', 'Incense (Tibetan Herbal)', 4, 1, 8, 30, 25.00, 1, 'Handmade Tibetan herbal temple incense sticks', 'low_stock'),
        (4, 'ITM-00045', 'Maroon Robe Set', 2, 6, 5, 15, 850.00, 1, 'Full monastic robe set for ordained monks', 'low_stock'),
        (5, 'ITM-00010', 'Cement (50 Kg Bags)', 1, 3, 120, 40, 320.00, 3, 'Grade 53 Portland Cement for Stupa foundation', 'in_stock'),
        (6, 'ITM-00012', 'Rice (25 Kg Bags)', 3, 3, 85, 30, 1500.00, 2, 'Premium Sona Masoori Rice for Monastery Kitchen', 'in_stock'),
        (7, 'ITM-00088', 'Pure Ghee for Altar (15 Kg)', 3, 4, 22, 10, 4200.00, 2, 'Clarified butter for 108 eternal lamps', 'in_stock'),
        (8, 'ITM-00090', 'Granite Stone Blocks (Carved)', 1, 1, 45, 15, 1200.00, 3, 'Hand-carved Bhutanese granite blocks for Stupa spire', 'in_stock'),
        (9, 'ITM-00033', 'Meditation Cushion (Zafu)', 2, 1, 60, 20, 350.00, 1, 'Round meditation cushion for assembly hall', 'in_stock'),
        (10, 'ITM-00099', 'Gold Leaf Sheets (Pack 100)', 4, 4, 2, 5, 6500.00, 1, '24K Pure Gold leaf for Stupa pinnacle gilding', 'low_stock')
      `);
    }

    // 9. Ensure Projects & Tasks baseline exists
    const [prjRows] = await pool.query(`SELECT COUNT(*) as count FROM projects`);
    if (prjRows[0].count === 0) {
      await pool.query(`
        INSERT INTO projects (id, project_code, title, slug, category, description, estimated_budget, actual_expenditure, currency, start_date, target_completion_date, status, completion_percent, location, manager_name) VALUES
        (1, 'PRJ-STUPA-01', 'Great Druk Wangyel Peace Stupa', 'great-druk-wangyel-peace-stupa', 'Stupa Construction', 'Construction of the 108-foot Great Druk Wangyel Peace Stupa.', 15000000.00, 6850000.00, 'INR', '2025-01-01', '2027-12-31', 'in_progress', 48, 'Gelephu, Sarpang Dzongkhag, Bhutan', 'Ugyen Tshering'),
        (2, 'PRJ-SHEDRA-02', 'Shedra Monastic University Library & Hall', 'shedra-monastic-library', 'Shedra Expansion', 'Two-story Tibetan classical library housing 5,000+ sacred texts.', 5000000.00, 2100000.00, 'INR', '2026-01-15', '2026-11-30', 'in_progress', 60, 'Monastery Campus, Gelephu', 'Khenpo Tashi Dorji'),
        (3, 'PRJ-EVENT-03', 'Grand Annual Ganachakra Puja', 'grand-annual-ganachakra-puja', 'Dharma Event', '5-day grand congregation of 500+ monks and devotees.', 800000.00, 650000.00, 'INR', '2026-08-25', '2026-08-30', 'in_progress', 85, 'Main Shrine Hall', 'Karma Choden')
      `);
      await pool.query(`
        INSERT INTO project_tasks (id, project_id, title, assigned_to, priority, status, due_date) VALUES
        (1, 1, 'Granite Foundation Leveling & Reinforcement', 'Dorji Masons Team', 'high', 'completed', '2026-08-15'),
        (2, 1, 'Relic Chamber Inner Core Stone Carving', 'Kinley Carvers Team', 'urgent', 'in_progress', '2026-09-10'),
        (3, 1, 'Spire Pinnacle Copper Fabrication', 'Artisan Metals Guild', 'medium', 'pending', '2026-10-01'),
        (4, 2, 'Library Teakwood Shelf Framing', 'Sangay Carpenters', 'medium', 'in_progress', '2026-09-20')
      `);
    }

    // 10. Ensure Contacts baseline exists
    const [cntRows] = await pool.query(`SELECT COUNT(*) as count FROM contacts`);
    if (cntRows[0].count === 0) {
      await pool.query(`
        INSERT INTO contacts (id, contact_type, full_name, organization_name, email, phone, city, country, tags, lifetime_value, last_contact_date) VALUES
        (1, 'donor', 'Tashi Phuntsho', 'Individual Devotee', 'tashi.phuntsho@email.com', '+975 17 55 8899', 'Gelephu', 'Bhutan', 'Major Donor, Stupa Patron', 125000.00, CURDATE()),
        (2, 'donor', 'Maria Wangmo', 'Individual Devotee', 'maria.wangmo@email.com', '+975 17 88 1234', 'Thimphu', 'Bhutan', 'Regular Donor, Food Sponsor', 45000.00, CURDATE()),
        (3, 'donor', 'Alan Johnson', 'San Francisco Sangha', 'alan.johnson@email.com', '+1 415 889 9000', 'San Francisco', 'United States', 'International Donor, VIP', 85500.00, CURDATE()),
        (4, 'partner', 'Druk Heritage Cultural Trust', 'Druk Heritage Trust', 'info@drukheritage.org', '+975 2 334455', 'Thimphu', 'Bhutan', 'Institutional Partner', 500000.00, CURDATE())
      `);
    }

    console.log('✅ Automated Bhutanese media assets & operational baseline synchronized into database.');
  } catch (err) {
    // Non-fatal if tables don't exist yet
  }
}

// Start Server
async function startServer() {
  await testConnection();
  await autoMigrateBhutanAssets();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`☸ Drodul Phendey Ling Monastery CRM Server Online`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🛡️  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Uploads Dir: ${uploadDir}`);
    console.log(`=======================================================`);
  });
}

startServer();

module.exports = app;
