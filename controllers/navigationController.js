const { pool } = require('../config/db');

// 1. GET STRUCTURED NAVIGATION (Public & Admin)
async function getNavigation(req, res, next) {
  try {
    const showAll = req.query.all === 'true';

    let [allRows] = await pool.query(
      `SELECT * FROM navigation_items ORDER BY menu_location ASC, sort_order ASC, id ASC`
    );

    // Self-healing auto-seed if table is empty
    if (allRows.length === 0) {
      const defaultSeeds = [
        ['header', 'Home', '/', 0, 0, 1, 1],
        ['header', 'About Us', '/about', 0, 0, 2, 1],
        ['header', 'Shedra', '/shedra', 0, 0, 3, 1],
        ['header', 'Prayers', '/prayer-request', 0, 0, 4, 1],
        ['header', 'Learning', '/learning', 0, 0, 5, 1],
        ['header', 'Blog', '/blog', 0, 0, 6, 1],
        ['header', 'Gallery', '/gallery', 0, 0, 7, 1],
        ['header', 'Contact', '/contact', 0, 0, 8, 1],

        ['footer_programs', '108ft Peace Stupa', '/about', 0, 0, 1, 1],
        ['footer_programs', 'Shedra Monastic Academy', '/shedra', 0, 0, 2, 1],
        ['footer_programs', 'Butter Lamp Illuminations', '/prayer-request', 0, 0, 3, 1],
        ['footer_programs', 'Dharma LMS Video Hub', '/learning', 0, 0, 4, 1],

        ['footer_about', 'Sacred Mandate & Abbot', '/about', 0, 0, 1, 1],
        ['footer_about', 'Tax Exemption & 80G', '/donate', 0, 0, 2, 1],
        ['footer_about', 'Monastic Photo Archives', '/gallery', 0, 0, 3, 1],
        ['footer_about', 'Track Offering (UTR)', '/tracking', 0, 0, 4, 1],

        ['footer_legal', 'Terms of Consecration', '/contact', 0, 0, 1, 1],
        ['footer_legal', 'Donor Privacy Policy', '/contact', 0, 0, 2, 1],
        ['footer_legal', 'Secretariat Verification', '/contact', 0, 0, 3, 1],
      ];

      await pool.query(
        `INSERT INTO navigation_items (menu_location, label, url, is_external, target_blank, sort_order, is_active) VALUES ?`,
        [defaultSeeds]
      );

      const [reloadedAll] = await pool.query(
        `SELECT * FROM navigation_items ORDER BY menu_location ASC, sort_order ASC, id ASC`
      );
      allRows = reloadedAll;
    }

    const [activeRows] = await pool.query(
      `SELECT * FROM navigation_items 
       WHERE is_active = 1 
       ORDER BY sort_order ASC, id ASC`
    );

    const sourceRows = showAll ? allRows : activeRows;

    const nav = {
      header: [],
      footer_programs: [],
      footer_about: [],
      footer_legal: [],
    };

    sourceRows.forEach((item) => {
      const loc = item.menu_location || 'header';
      if (nav[loc]) {
        nav[loc].push({
          id: item.id,
          label: item.label,
          url: item.url,
          isExternal: Boolean(item.is_external),
          targetBlank: Boolean(item.target_blank),
          sortOrder: item.sort_order,
          isActive: Boolean(item.is_active),
          linkedPageId: item.linked_page_id,
        });
      }
    });

    return res.json({
      success: true,
      data: nav,
      raw: allRows.map((r) => ({
        ...r,
        is_external: Boolean(r.is_external),
        target_blank: Boolean(r.target_blank),
        is_active: Boolean(r.is_active),
      })),
    });
  } catch (error) {
    next(error);
  }
}

// 2. CREATE NAVIGATION ITEM (Admin)
async function createNavigationItem(req, res, next) {
  try {
    const {
      menu_location = 'header',
      menuLocation,
      label,
      url,
      is_external = 0,
      isExternal,
      target_blank = 0,
      targetBlank,
      sort_order = 0,
      sortOrder,
      is_active = 1,
      isActive,
      linked_page_id = null,
      linkedPageId,
    } = req.body;

    const finalLocation = menuLocation || menu_location;
    const finalLabel = (label || '').trim();
    const finalUrl = (url || '').trim();

    if (!finalLabel || !finalUrl) {
      return res.status(400).json({ success: false, message: 'Navigation label and URL are required.' });
    }

    const finalExt = isExternal !== undefined ? (isExternal ? 1 : 0) : (is_external ? 1 : 0);
    const finalTarget = targetBlank !== undefined ? (targetBlank ? 1 : 0) : (target_blank ? 1 : 0);
    const finalOrder = sortOrder !== undefined ? sortOrder : sort_order;
    const finalActive = isActive !== undefined ? (isActive ? 1 : 0) : (is_active ? 1 : 0);
    const finalPageId = linkedPageId !== undefined ? linkedPageId : linked_page_id;

    const [result] = await pool.query(
      `INSERT INTO navigation_items (menu_location, label, url, is_external, target_blank, sort_order, is_active, linked_page_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [finalLocation, finalLabel, finalUrl, finalExt, finalTarget, finalOrder, finalActive, finalPageId]
    );

    return res.status(201).json({
      success: true,
      message: 'Navigation item added successfully.',
      id: result.insertId,
      data: { id: result.insertId },
    });
  } catch (error) {
    next(error);
  }
}

// 3. UPDATE NAVIGATION ITEM (Admin)
async function updateNavigationItem(req, res, next) {
  try {
    const { id } = req.params;
    const {
      menu_location,
      menuLocation,
      label,
      url,
      is_external,
      isExternal,
      target_blank,
      targetBlank,
      sort_order,
      sortOrder,
      is_active,
      isActive,
    } = req.body;

    const [existing] = await pool.query('SELECT * FROM navigation_items WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Navigation item not found.' });
    }

    const current = existing[0];
    const finalLoc = menuLocation !== undefined ? menuLocation : (menu_location !== undefined ? menu_location : current.menu_location);
    const finalLabel = label !== undefined ? label.trim() : current.label;
    const finalUrl = url !== undefined ? url.trim() : current.url;
    const finalExt = isExternal !== undefined ? (isExternal ? 1 : 0) : (is_external !== undefined ? (is_external ? 1 : 0) : current.is_external);
    const finalTarget = targetBlank !== undefined ? (targetBlank ? 1 : 0) : (target_blank !== undefined ? (target_blank ? 1 : 0) : current.target_blank);
    const finalOrder = sortOrder !== undefined ? sortOrder : (sort_order !== undefined ? sort_order : current.sort_order);
    const finalActive = isActive !== undefined ? (isActive ? 1 : 0) : (is_active !== undefined ? (is_active ? 1 : 0) : current.is_active);

    await pool.query(
      `UPDATE navigation_items SET
        menu_location = ?, label = ?, url = ?, is_external = ?,
        target_blank = ?, sort_order = ?, is_active = ?
       WHERE id = ?`,
      [finalLoc, finalLabel, finalUrl, finalExt, finalTarget, finalOrder, finalActive, id]
    );

    return res.json({ success: true, message: 'Navigation item updated successfully.' });
  } catch (error) {
    next(error);
  }
}

// 4. DELETE NAVIGATION ITEM (Admin)
async function deleteNavigationItem(req, res, next) {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM navigation_items WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Navigation item not found.' });
    }

    await pool.query('DELETE FROM navigation_items WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Navigation item removed.' });
  } catch (error) {
    next(error);
  }
}

// 5. REORDER NAVIGATION ITEMS (Admin)
async function reorderNavigation(req, res, next) {
  try {
    const { items } = req.body; // array of { id, sort_order }
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array is required for reordering.' });
    }

    for (const item of items) {
      if (item.id && item.sort_order !== undefined) {
        await pool.query('UPDATE navigation_items SET sort_order = ? WHERE id = ?', [item.sort_order, item.id]);
      }
    }

    return res.json({ success: true, message: 'Navigation order updated successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNavigation,
  createNavigationItem,
  updateNavigationItem,
  deleteNavigationItem,
  reorderNavigation,
};
