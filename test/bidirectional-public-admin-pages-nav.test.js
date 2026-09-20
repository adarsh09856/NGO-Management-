/**
 * ============================================================================
 * BIDIRECTIONAL PUBLIC <-> ADMIN TEST SUITE:
 * PAGES DIRECTORY, BESPOKE CUSTOM PAGES & NAVIGATION MANAGER
 * ============================================================================
 */

const axios = require('axios');
const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('../server');
const { pool, testConnection } = require('../config/db');

let server;
let baseURL;
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
    throw new Error(message);
  }
}

async function runTests() {
  try {
    await testConnection();
    const port = 53000 + Math.floor(Math.random() * 1000);
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(port, resolve));
    baseURL = `http://127.0.0.1:${port}/api`;

    console.log('\n================================================================');
    console.log('☸  BIDIRECTIONAL PUBLIC <-> ADMIN: PAGES & NAVIGATION TEST SUITE');
    console.log('================================================================');
    console.log(`🚀 Test server running at ${baseURL}\n`);

    const JWT_SECRET = process.env.JWT_SECRET || 'dpl_monastery_super_secure_jwt_secret_key_2026_bhutan';
    const adminToken = jwt.sign(
      { userId: 1, id: 1, email: 'contact@drodulphendeyling.org', role: 'super_admin' },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    const adminHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };

    // =========================================================================
    // TEST 1: SELF-HEALING AUTO-SEEDS & INITIAL DATA RETRIEVAL
    // =========================================================================
    console.log('--- TEST 1: Self-Healing Auto-Seeds & Initial Data ---');

    const navRes = await axios.get(`${baseURL}/navigation`);
    assert(navRes.data?.success === true, 'Public /navigation endpoint responds with success');
    assert(Array.isArray(navRes.data?.data?.header), 'Navigation response contains header items array');
    assert(navRes.data?.data?.header.length > 0, `Header menu has ${navRes.data?.data?.header.length} items populated`);
    assert(Array.isArray(navRes.data?.data?.footer_programs), 'Navigation response contains footer_programs items');

    const pagesRes = await axios.get(`${baseURL}/pages?all=true`, adminHeaders);
    assert(pagesRes.data?.success === true, 'Admin /pages?all=true responds with success');
    assert(Array.isArray(pagesRes.data?.data), 'Pages response contains data array');
    assert(pagesRes.data?.data.length > 0, `Custom pages list has ${pagesRes.data?.data.length} pages populated`);

    // =========================================================================
    // TEST 2: NAVIGATION MANAGER BIDIRECTIONAL FLOW
    // =========================================================================
    console.log('\n--- TEST 2: Navigation Manager Bidirectional Flow ---');

    // 2.1 Admin creates a new navigation link
    const newNavPayload = {
      menu_location: 'header',
      label: 'Sacred Meditation Cave',
      url: '/pages/sacred-meditation-cave',
      is_external: false,
      target_blank: false,
      is_active: true,
      sort_order: 99
    };
    const createNavRes = await axios.post(`${baseURL}/navigation`, newNavPayload, adminHeaders);
    assert(createNavRes.data?.success === true, 'Admin successfully created new header navigation link');
    const createdNavId = createNavRes.data?.data?.id;
    assert(Boolean(createdNavId), `Created navigation item ID: ${createdNavId}`);

    // 2.2 Public visitor retrieves navigation - verifies new link appears
    const publicNavAfterAdd = await axios.get(`${baseURL}/navigation`);
    const foundInHeader = publicNavAfterAdd.data?.data?.header?.find((i) => i.id === createdNavId);
    assert(Boolean(foundInHeader), 'Newly created navigation link is immediately visible in public header navigation');
    assert(foundInHeader?.label === 'Sacred Meditation Cave', 'Navigation link label matches exactly');

    // 2.3 Admin toggles navigation item to inactive
    const toggleNavRes = await axios.put(`${baseURL}/navigation/${createdNavId}`, { is_active: false }, adminHeaders);
    assert(toggleNavRes.data?.success === true, 'Admin marked navigation link as inactive');

    // 2.4 Public visitor retrieves navigation - verifies hidden item is excluded
    const publicNavAfterHide = await axios.get(`${baseURL}/navigation`);
    const hiddenInPublic = publicNavAfterHide.data?.data?.header?.find((i) => i.id === createdNavId);
    assert(!hiddenInPublic, 'Inactive navigation link is excluded from public navigation');

    // 2.5 Admin retrieves navigation with all=true - verifies hidden item is present
    const adminNavWithAll = await axios.get(`${baseURL}/navigation?all=true`, adminHeaders);
    const hiddenInAdmin = adminNavWithAll.data?.data?.header?.find((i) => i.id === createdNavId);
    assert(Boolean(hiddenInAdmin), 'Inactive navigation link remains accessible and visible to Admin in manager');
    assert(hiddenInAdmin?.isActive === false, 'Navigation item reports isActive: false correctly');

    // 2.6 Admin deletes the navigation link
    const deleteNavRes = await axios.delete(`${baseURL}/navigation/${createdNavId}`, adminHeaders);
    assert(deleteNavRes.data?.success === true, 'Admin deleted the test navigation link');

    // =========================================================================
    // TEST 3: BESPOKE CUSTOM PAGES CRUD & DRAFT SECURITY
    // =========================================================================
    console.log('\n--- TEST 3: Bespoke Custom Pages CRUD & Draft Security ---');

    const testSlug = `monastery-retreat-hermitage-${Date.now()}`;
    const pagePayload = {
      title: 'Tango Monastery Sacred Hermitage',
      slug: testSlug,
      category: 'Pilgrimage',
      excerpt: 'High mountain hermitage dedicated to solitary retreat and contemplation.',
      content: 'Detailed chronicle of the sacred hermitage perched amidst Himalayan cliffs.',
      banner_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      gallery_images: [
        { url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800', caption: 'Hermitage dawn' }
      ],
      social_links: { facebook: 'https://facebook.com', youtube: '' },
      cta_button: { label: 'Inquire for Solitary Retreat', url: '/contact', style: 'primary' },
      seo_title: 'Tango Hermitage Retreat Bhutan',
      seo_description: 'Sacred mountain hermitage for Buddhist contemplation.',
      seo_keywords: 'hermitage, retreat, bhutan, contemplation',
      is_published: false // Created as DRAFT!
    };

    // 3.1 Admin creates page as Draft
    const createPageRes = await axios.post(`${baseURL}/pages`, pagePayload, adminHeaders);
    assert(createPageRes.data?.success === true, 'Admin successfully created custom page');
    const createdPageId = createPageRes.data?.data?.id;
    assert(Boolean(createdPageId), `Created page ID: ${createdPageId}`);

    // 3.2 Public visitor attempts to view draft page -> MUST RETURN 404
    let publicDraftBlocked = false;
    try {
      await axios.get(`${baseURL}/pages/by-slug/${testSlug}`);
    } catch (err) {
      if (err.response?.status === 404) {
        publicDraftBlocked = true;
      }
    }
    assert(publicDraftBlocked, 'Security Check: Draft custom page is strictly inaccessible (404) to unauthenticated visitors');

    // 3.3 Admin views draft page -> MUST SUCCEED (200)
    const adminDraftView = await axios.get(`${baseURL}/pages/by-slug/${testSlug}`, adminHeaders);
    assert(adminDraftView.data?.success === true, 'Admin can preview draft custom page with authentication');
    assert(adminDraftView.data?.data?.is_published === 0 || adminDraftView.data?.data?.is_published === false, 'Draft indicator is preserved');

    // 3.4 Admin publishes the custom page
    const publishPageRes = await axios.put(
      `${baseURL}/pages/${createdPageId}`,
      { ...pagePayload, is_published: true, title: 'Tango Monastery Sacred Hermitage (Consecrated)' },
      adminHeaders
    );
    assert(publishPageRes.data?.success === true, 'Admin published and updated custom page');

    // 3.5 Public visitor now views the published page -> MUST SUCCEED (200)
    const publicPublishedView = await axios.get(`${baseURL}/pages/by-slug/${testSlug}`);
    assert(publicPublishedView.data?.success === true, 'Published custom page is now immediately public');
    assert(publicPublishedView.data?.data?.title === 'Tango Monastery Sacred Hermitage (Consecrated)', 'Updated title is live');
    assert(Array.isArray(publicPublishedView.data?.data?.gallery_images), 'Gallery images parsed correctly as array');
    assert(publicPublishedView.data?.data?.gallery_images.length === 1, 'Gallery has 1 photo attached');

    // 3.6 Admin deletes the custom page
    const deletePageRes = await axios.delete(`${baseURL}/pages/${createdPageId}`, adminHeaders);
    assert(deletePageRes.data?.success === true, 'Admin deleted custom page');

    // 3.7 Public visitor gets 404 after deletion
    let publicDeleted404 = false;
    try {
      await axios.get(`${baseURL}/pages/by-slug/${testSlug}`);
    } catch (err) {
      if (err.response?.status === 404) {
        publicDeleted404 = true;
      }
    }
    assert(publicDeleted404, 'Deleted page is no longer accessible publicly (404)');

    // =========================================================================
    // TEST SUMMARY
    // =========================================================================
    console.log('\n================================================================');
    console.log(`🏁 BIDIRECTIONAL TEST COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

    if (server) server.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST RUNNER EXCEPTION:', err.message);
    if (err.response) {
      console.error('API Response Data:', err.response.data);
    }
    if (server) server.close();
    process.exit(1);
  }
}

runTests();
