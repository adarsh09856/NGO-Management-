const { pool } = require('../config/db');

// Helper to check if request is from an authorized admin/staff user
function isUserAdmin(req) {
  if (!req.user) return false;
  const role = req.user.role?.slug || req.user.role_slug || req.user.role;
  return ['super_admin', 'admin', 'staff', 'hr_manager', 'accountant'].includes(role);
}

// Safely parse JSON or return original value
function safeJsonParse(val, fallback = null) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (_) {
    return fallback;
  }
}

// 1. GET ALL CUSTOM PAGES
async function getPages(req, res, next) {
  try {
    const { category, search, all } = req.query;
    const isAdmin = isUserAdmin(req);

    let query = `SELECT * FROM custom_pages WHERE 1=1`;
    const params = [];

    // Public visitors only see published pages
    if (!isAdmin && all !== 'true') {
      query += ` AND is_published = 1`;
    }

    if (category && category !== 'All') {
      query += ` AND category = ?`;
      params.push(category);
    }

    if (search && search.trim()) {
      query += ` AND (title LIKE ? OR excerpt LIKE ? OR seo_keywords LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY id DESC`;

    let [rows] = await pool.query(query, params);

    // Self-healing auto-seed if custom_pages table is completely empty
    if (rows.length === 0 && (!category || category === 'All') && (!search || !search.trim())) {
      const [countCheck] = await pool.query('SELECT COUNT(*) as cnt FROM custom_pages');
      if (countCheck[0]?.cnt === 0) {
        const defaultPages = [
          [
            'great-druk-wangyel-peace-stupa',
            '108ft Great Druk Wangyel Peace Stupa',
            'Sacred Stupa',
            'Monumental 108ft World Peace Stupa consecrated in Gelephu, Bhutan, housing 108 sacred prayer wheels and rare relics.',
            '༄༅། །The Great Druk Wangyel Peace Stupa stands as a monumental beacon of global compassion and inner tranquility.\n\nRising 108 feet above the sacred foothills of Gelephu, Bhutan, this architectural jewel was consecrated under the spiritual patronage of the Royal Grandmother and venerated Buddhist masters.\n\nEvery visitor and pilgrim who circumambulates this sacred sanctuary generates boundless merit for the peace, harmony, and longevity of all sentient beings.',
            'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80',
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            JSON.stringify([
              { url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800', caption: 'Consecration ceremony of the Great Peace Stupa pinnacle' },
              { url: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=800', caption: '108 Bronze Prayer Wheels installed along outer circumambulation path' },
              { url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800', caption: 'Twilight butter lamp offering at the stupa sanctum' }
            ]),
            JSON.stringify({ facebook: 'https://facebook.com', youtube: 'https://youtube.com', instagram: '', whatsapp: '' }),
            JSON.stringify({ label: 'Support Stupa Construction', url: '/donate', style: 'primary' }),
            '108ft Great Druk Wangyel Peace Stupa · Drodul Phendey Ling',
            'Discover the historic 108ft Great Druk Wangyel Peace Stupa in Gelephu, Bhutan. Relics, 108 prayer wheels, and global world peace mandate.',
            'peace stupa, druk wangyel, bhutan monastery, buddhist relics, gelephu',
            1, 1, 1
          ],
          [
            'shedra-monastic-university',
            'Shedra Monastic Higher University & Curriculum',
            'Shedra Academy',
            '9-year higher Buddhist philosophy degree programs providing full scholarships, residential quarters, and classical debate.',
            '༄༅། །Drodul Phendey Ling Shedra Monastic Institute provides authentic higher education in the classical Madhyamaka, Prajnaparamita, Abhidharma, Pramana, and Vinaya disciplines.\n\nOver 350 monk scholars undergo intensive daily debate, scriptural memorization, and contemplative practice under qualified Lopons and Khenpos.',
            'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1600&q=80',
            null,
            JSON.stringify([]),
            JSON.stringify({}),
            JSON.stringify({ label: 'Shedra Admissions & Scholarships', url: '/shedra', style: 'primary' }),
            'Shedra Monastic University · Buddhist Higher Education Bhutan',
            'Explore the 9-year Buddhist philosophy curriculum at Drodul Phendey Ling Shedra Monastic University.',
            'shedra, buddhist university, monk education, shastras, debate',
            1, 1, 1
          ],
          [
            'perpetual-butter-lamp-prayers',
            'Perpetual Butter Lamp Puja & Merit Offerings',
            'Butter Lamps',
            'Daily consecration of 108 butter lamps dedicated to all sentient beings for the eradication of darkness and obstacles.',
            '༄༅། །Lighting a sacred butter lamp represents the illumination of primordial wisdom and the dispelling of the darkness of ignorance.\n\nIn our monastery shrine, butter lamps burn continuously day and night, consecrated by prayers recited for world peace, longevity, and liberation.',
            'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1600&q=80',
            null,
            JSON.stringify([]),
            JSON.stringify({}),
            JSON.stringify({ label: 'Light 108 Butter Lamps', url: '/prayer-request', style: 'primary' }),
            'Perpetual Butter Lamp Offerings · Sacred Pujas Bhutan',
            'Dedicate 108 consecrated butter lamps at Drodul Phendey Ling Monastery for your loved ones.',
            'butter lamps, puja, buddhist prayers, merit offering',
            1, 0, 1
          ],
          [
            'monastic-sangha-welfare',
            'Monastic Sangha Welfare & Healthcare Mandate',
            'Monastic Heritage',
            'Ensuring comprehensive healthcare, clean nutrition, robing, and living facilities for young novice monks and senior scholars.',
            '༄༅། །The preservation of the Buddha Dharma depends fundamentally on the physical and spiritual welfare of the Sangha community.\n\nOur healthcare and sustenance program covers all residential monks with medical insurance, clinic visits, nutritious vegetarian dining, and monastic robes.',
            'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80',
            null,
            JSON.stringify([]),
            JSON.stringify({}),
            JSON.stringify({ label: 'Support Monk Healthcare Fund', url: '/donate', style: 'primary' }),
            'Monastic Sangha Welfare & Healthcare · Drodul Phendey Ling',
            'Directly support young monks and scholar healthcare, nutrition, and education in Bhutan.',
            'monk welfare, sangha health, monastic care, donation',
            1, 0, 1
          ]
        ];

        await pool.query(
          `INSERT INTO custom_pages (
            slug, title, category, excerpt, content, banner_url, video_url,
            gallery_images, social_links, cta_button, seo_title, seo_description, seo_keywords,
            is_published, show_in_header_nav, show_in_footer_nav
          ) VALUES ?`,
          [defaultPages]
        );

        const [reloaded] = await pool.query(query, params);
        rows = reloaded;
      }
    }

    const formatted = rows.map((row) => ({
      ...row,
      gallery_images: safeJsonParse(row.gallery_images, []),
      social_links: safeJsonParse(row.social_links, {}),
      cta_button: safeJsonParse(row.cta_button, { label: '', url: '', style: 'primary' }),
      is_published: Boolean(row.is_published),
      show_in_header_nav: Boolean(row.show_in_header_nav),
      show_in_footer_nav: Boolean(row.show_in_footer_nav),
    }));

    return res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
}

// 2. GET SINGLE CUSTOM PAGE BY SLUG
async function getPageBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const isAdmin = isUserAdmin(req);

    const [rows] = await pool.query(`SELECT * FROM custom_pages WHERE slug = ?`, [slug]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Custom page not found.' });
    }

    const page = rows[0];

    // Security Gate: If page is unpublished draft and user is not admin, return 404
    if (!page.is_published && !isAdmin) {
      return res.status(404).json({ success: false, message: 'Custom page not found or is in draft mode.' });
    }

    // Increment public view counter
    try {
      await pool.query(`UPDATE custom_pages SET views_count = views_count + 1 WHERE id = ?`, [page.id]);
    } catch (_) {}

    const formatted = {
      ...page,
      gallery_images: safeJsonParse(page.gallery_images, []),
      social_links: safeJsonParse(page.social_links, {}),
      cta_button: safeJsonParse(page.cta_button, { label: '', url: '', style: 'primary' }),
      is_published: Boolean(page.is_published),
      show_in_header_nav: Boolean(page.show_in_header_nav),
      show_in_footer_nav: Boolean(page.show_in_footer_nav),
    };

    return res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
}

// 3. CREATE NEW CUSTOM PAGE (Admin)
async function createPage(req, res, next) {
  try {
    const {
      title,
      slug: rawSlug,
      category = 'General',
      excerpt = '',
      content = '',
      bannerUrl,
      banner_url,
      videoUrl,
      video_url,
      galleryImages,
      gallery_images,
      socialLinks,
      social_links,
      ctaButton,
      cta_button,
      seoTitle,
      seo_title,
      seoDescription,
      seo_description,
      seoKeywords,
      seo_keywords,
      isPublished,
      is_published,
      showInHeaderNav,
      show_in_header_nav,
      showInFooterNav,
      show_in_footer_nav,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Page title is required.' });
    }

    // Generate clean URL slug
    let finalSlug = (rawSlug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (!finalSlug) {
      finalSlug = `page-${Date.now()}`;
    }

    // Check slug collision
    const [existing] = await pool.query('SELECT id FROM custom_pages WHERE slug = ?', [finalSlug]);
    if (existing.length > 0) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const finalBanner = bannerUrl || banner_url || null;
    const finalVideo = videoUrl || video_url || null;
    const finalGallery = JSON.stringify(galleryImages || gallery_images || []);
    const finalSocial = JSON.stringify(socialLinks || social_links || {});
    const finalCta = JSON.stringify(ctaButton || cta_button || { label: '', url: '', style: 'primary' });
    const finalSeoTitle = seoTitle || seo_title || title;
    const finalSeoDesc = seoDescription || seo_description || excerpt || '';
    const finalSeoKeywords = seoKeywords || seo_keywords || '';
    const finalPublished = isPublished !== undefined ? (isPublished ? 1 : 0) : (is_published !== undefined ? (is_published ? 1 : 0) : 1);
    const finalHeaderNav = showInHeaderNav !== undefined ? (showInHeaderNav ? 1 : 0) : (show_in_header_nav !== undefined ? (show_in_header_nav ? 1 : 0) : 0);
    const finalFooterNav = showInFooterNav !== undefined ? (showInFooterNav ? 1 : 0) : (show_in_footer_nav !== undefined ? (show_in_footer_nav ? 1 : 0) : 0);

    const [result] = await pool.query(
      `INSERT INTO custom_pages (
        slug, title, category, excerpt, content, banner_url, video_url,
        gallery_images, social_links, cta_button, seo_title, seo_description,
        seo_keywords, is_published, show_in_header_nav, show_in_footer_nav
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        finalSlug,
        title.trim(),
        category.trim() || 'General',
        excerpt || '',
        content || '',
        finalBanner,
        finalVideo,
        finalGallery,
        finalSocial,
        finalCta,
        finalSeoTitle,
        finalSeoDesc,
        finalSeoKeywords,
        finalPublished,
        finalHeaderNav,
        finalFooterNav,
      ]
    );

    const newPageId = result.insertId;

    // Auto-sync into navigation items if selected
    try {
      const pageUrl = `/pages/${finalSlug}`;
      if (finalHeaderNav) {
        await pool.query(
          `INSERT INTO navigation_items (menu_location, label, url, is_external, sort_order, is_active, linked_page_id)
           VALUES ('header', ?, ?, 0, 99, 1, ?)`,
          [title.trim(), pageUrl, newPageId]
        );
      }
      if (finalFooterNav) {
        await pool.query(
          `INSERT INTO navigation_items (menu_location, label, url, is_external, sort_order, is_active, linked_page_id)
           VALUES ('footer_about', ?, ?, 0, 99, 1, ?)`,
          [title.trim(), pageUrl, newPageId]
        );
      }
    } catch (navErr) {
      console.warn('[Pages] Non-fatal navigation auto-sync warning:', navErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Custom page published successfully.',
      id: newPageId,
      slug: finalSlug,
      data: { id: newPageId, slug: finalSlug },
    });
  } catch (error) {
    next(error);
  }
}

// 4. UPDATE CUSTOM PAGE (Admin)
async function updatePage(req, res, next) {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      category,
      excerpt,
      content,
      bannerUrl,
      banner_url,
      videoUrl,
      video_url,
      galleryImages,
      gallery_images,
      socialLinks,
      social_links,
      ctaButton,
      cta_button,
      seoTitle,
      seo_title,
      seoDescription,
      seo_description,
      seoKeywords,
      seo_keywords,
      isPublished,
      is_published,
      showInHeaderNav,
      show_in_header_nav,
      showInFooterNav,
      show_in_footer_nav,
    } = req.body;

    const [existing] = await pool.query('SELECT * FROM custom_pages WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Custom page not found.' });
    }

    const current = existing[0];
    const finalTitle = title !== undefined ? title.trim() : current.title;
    const finalSlug = slug !== undefined ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : current.slug;
    const finalCategory = category !== undefined ? category.trim() : current.category;
    const finalExcerpt = excerpt !== undefined ? excerpt : current.excerpt;
    const finalContent = content !== undefined ? content : current.content;
    const finalBanner = bannerUrl !== undefined ? bannerUrl : (banner_url !== undefined ? banner_url : current.banner_url);
    const finalVideo = videoUrl !== undefined ? videoUrl : (video_url !== undefined ? video_url : current.video_url);
    const finalGallery = galleryImages !== undefined || gallery_images !== undefined ? JSON.stringify(galleryImages || gallery_images) : current.gallery_images;
    const finalSocial = socialLinks !== undefined || social_links !== undefined ? JSON.stringify(socialLinks || social_links) : current.social_links;
    const finalCta = ctaButton !== undefined || cta_button !== undefined ? JSON.stringify(ctaButton || cta_button) : current.cta_button;
    const finalSeoTitle = seoTitle !== undefined ? seoTitle : (seo_title !== undefined ? seo_title : current.seo_title);
    const finalSeoDesc = seoDescription !== undefined ? seoDescription : (seo_description !== undefined ? seo_description : current.seo_description);
    const finalSeoKeywords = seoKeywords !== undefined ? seoKeywords : (seo_keywords !== undefined ? seo_keywords : current.seo_keywords);
    const finalPublished = isPublished !== undefined ? (isPublished ? 1 : 0) : (is_published !== undefined ? (is_published ? 1 : 0) : current.is_published);
    const finalHeaderNav = showInHeaderNav !== undefined ? (showInHeaderNav ? 1 : 0) : (show_in_header_nav !== undefined ? (show_in_header_nav ? 1 : 0) : current.show_in_header_nav);
    const finalFooterNav = showInFooterNav !== undefined ? (showInFooterNav ? 1 : 0) : (show_in_footer_nav !== undefined ? (show_in_footer_nav ? 1 : 0) : current.show_in_footer_nav);

    await pool.query(
      `UPDATE custom_pages SET
        title = ?, slug = ?, category = ?, excerpt = ?, content = ?,
        banner_url = ?, video_url = ?, gallery_images = ?, social_links = ?,
        cta_button = ?, seo_title = ?, seo_description = ?, seo_keywords = ?,
        is_published = ?, show_in_header_nav = ?, show_in_footer_nav = ?
       WHERE id = ?`,
      [
        finalTitle, finalSlug, finalCategory, finalExcerpt, finalContent,
        finalBanner, finalVideo, finalGallery, finalSocial,
        finalCta, finalSeoTitle, finalSeoDesc, finalSeoKeywords,
        finalPublished, finalHeaderNav, finalFooterNav, id
      ]
    );

    // Sync navigation updates
    try {
      const pageUrl = `/pages/${finalSlug}`;
      // Header nav sync
      if (finalHeaderNav) {
        const [hExists] = await pool.query("SELECT id FROM navigation_items WHERE menu_location = 'header' AND (linked_page_id = ? OR url = ?)", [id, pageUrl]);
        if (hExists.length === 0) {
          await pool.query("INSERT INTO navigation_items (menu_location, label, url, is_external, sort_order, is_active, linked_page_id) VALUES ('header', ?, ?, 0, 99, 1, ?)", [finalTitle, pageUrl, id]);
        } else {
          await pool.query("UPDATE navigation_items SET label = ?, url = ?, is_active = 1 WHERE id = ?", [finalTitle, pageUrl, hExists[0].id]);
        }
      } else {
        await pool.query("DELETE FROM navigation_items WHERE menu_location = 'header' AND linked_page_id = ?", [id]);
      }

      // Footer nav sync
      if (finalFooterNav) {
        const [fExists] = await pool.query("SELECT id FROM navigation_items WHERE menu_location = 'footer_about' AND (linked_page_id = ? OR url = ?)", [id, pageUrl]);
        if (fExists.length === 0) {
          await pool.query("INSERT INTO navigation_items (menu_location, label, url, is_external, sort_order, is_active, linked_page_id) VALUES ('footer_about', ?, ?, 0, 99, 1, ?)", [finalTitle, pageUrl, id]);
        } else {
          await pool.query("UPDATE navigation_items SET label = ?, url = ?, is_active = 1 WHERE id = ?", [finalTitle, pageUrl, fExists[0].id]);
        }
      } else {
        await pool.query("DELETE FROM navigation_items WHERE menu_location = 'footer_about' AND linked_page_id = ?", [id]);
      }
    } catch (navErr) {
      console.warn('[Pages] Non-fatal navigation update sync warning:', navErr.message);
    }

    return res.json({
      success: true,
      message: 'Custom page updated successfully.',
      data: { id, slug: finalSlug, title: finalTitle }
    });
  } catch (error) {
    next(error);
  }
}

// 5. DELETE CUSTOM PAGE (Admin)
async function deletePage(req, res, next) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM custom_pages WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Custom page not found.' });
    }

    await pool.query('DELETE FROM custom_pages WHERE id = ?', [id]);
    await pool.query('DELETE FROM navigation_items WHERE linked_page_id = ?', [id]);

    return res.json({ success: true, message: 'Custom page deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPages,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
};
