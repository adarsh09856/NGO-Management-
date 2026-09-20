-- ===================================================================
-- Migration 008: Dynamic Custom Pages & Navigation Menus
-- ===================================================================

CREATE TABLE IF NOT EXISTS custom_pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(191) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'General',
  excerpt TEXT,
  content LONGTEXT,
  banner_url VARCHAR(500),
  video_url VARCHAR(500),
  gallery_images JSON,
  social_links JSON,
  cta_button JSON,
  seo_title VARCHAR(255),
  seo_description TEXT,
  seo_keywords VARCHAR(255),
  is_published TINYINT(1) DEFAULT 1,
  show_in_header_nav TINYINT(1) DEFAULT 0,
  show_in_footer_nav TINYINT(1) DEFAULT 0,
  views_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_custom_pages_slug (slug),
  INDEX idx_custom_pages_published (is_published),
  INDEX idx_custom_pages_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS navigation_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  menu_location ENUM('header', 'footer_programs', 'footer_about', 'footer_legal') NOT NULL DEFAULT 'header',
  label VARCHAR(100) NOT NULL,
  url VARCHAR(255) NOT NULL,
  is_external TINYINT(1) DEFAULT 0,
  target_blank TINYINT(1) DEFAULT 0,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  linked_page_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nav_location (menu_location),
  INDEX idx_nav_active_order (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial Navigation Seed (Header & Footer default items if table is empty)
INSERT IGNORE INTO navigation_items (id, menu_location, label, url, is_external, sort_order, is_active) VALUES
(1, 'header', 'Home', '/', 0, 1, 1),
(2, 'header', 'About Us', '/about', 0, 2, 1),
(3, 'header', 'Shedra Academy', '/shedra', 0, 3, 1),
(4, 'header', 'Butter Lamps & Prayers', '/prayer-request', 0, 4, 1),
(5, 'header', 'Dharma LMS', '/learning', 0, 5, 1),
(6, 'header', 'Sacred Gazette', '/blog', 0, 6, 1),
(7, 'header', 'Photo Archives', '/gallery', 0, 7, 1),
(8, 'header', 'Secretariat & Contact', '/contact', 0, 8, 1),

(9, 'footer_programs', '108ft Peace Stupa', '/about', 0, 1, 1),
(10, 'footer_programs', 'Shedra Monastic Academy', '/shedra', 0, 2, 1),
(11, 'footer_programs', 'Butter Lamp Illuminations', '/prayer-request', 0, 3, 1),
(12, 'footer_programs', 'Dharma LMS Video Hub', '/learning', 0, 4, 1),

(13, 'footer_about', 'Sacred Mandate & Abbot', '/about', 0, 1, 1),
(14, 'footer_about', 'Tax Exemption & 80G', '/donate', 0, 2, 1),
(15, 'footer_about', 'Monastic Photo Archives', '/gallery', 0, 3, 1),
(16, 'footer_about', 'Track Offering (UTR)', '/tracking', 0, 4, 1),

(17, 'footer_legal', 'Terms of Consecration', '/contact', 0, 1, 1),
(18, 'footer_legal', 'Donor Privacy Policy', '/contact', 0, 2, 1),
(19, 'footer_legal', 'Secretariat Verification', '/contact', 0, 3, 1);
