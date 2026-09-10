-- ===================================================================
-- Migration 005: Add must_change_password flag & Generic site_settings table
-- ===================================================================

-- 1. Add must_change_password flag to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS must_change_password TINYINT(1) DEFAULT 0 AFTER is_verified;

-- 2. Generic Key -> Value(JSON) Config Store for 100% Admin Dynamic Site Control
CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_group VARCHAR(50) NOT NULL,
  setting_value JSON NOT NULL,
  is_secret TINYINT(1) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT NULL,
  INDEX idx_group (setting_group)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Seed Default Key-Value Settings Rows
INSERT INTO site_settings (setting_key, setting_group, setting_value, is_secret) VALUES
('header_utility', 'header', '{
  "phone": "+975 17556559",
  "email": "contact@drodulphendeyling.org",
  "location": "Gelephu, Sarpang, Bhutan",
  "prayerDeskLink": "/prayer-request",
  "shedraMonkPortalLink": "/student"
}', 0),
('branding', 'branding', '{
  "title": "DRODUL PHENDEY LING",
  "tagline": "Building Peace. Empowering Lives.",
  "tibetanTitle": "༄༅། །དྲོ་བདུལ་ཕན་བདེ་གླིང་དགོན་པ།",
  "crestSymbol": "☸",
  "primaryColor": "#D4AF37",
  "accentColor": "#BE123C"
}', 0),
('home_hero', 'cms_home', '{
  "badgeText": "Gelephu, Bhutan",
  "headline": "BUILDING A SACRED LEGACY OF PEACE & WISDOM",
  "subtext": "Constructing the monumental 108ft Great Druk Wangyel Peace Stupa, expanding the Shedra Monastic University, and preserving authentic Buddha Dharma for global harmony in Gelephu, Bhutan.",
  "ctaPrimaryText": "OFFER A DONATION",
  "ctaSecondaryText": "EXPLORE OUR WORK",
  "bgImageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80"
}', 0),
('donation_presets', 'donations', '{
  "presetAmounts": [500, 1100, 2100, 5100, 11000],
  "defaultAmount": 1100,
  "currencies": ["INR", "Nu. BTN", "USD"],
  "enable80gTaxDeduction": true,
  "bankInstructions": {
    "bankName": "Bank of Bhutan (BoB)",
    "accountName": "Drodul Phendey Ling Foundation",
    "accountNumber": "200847291038",
    "swiftCode": "BHUBBTBT",
    "branch": "Gelephu Main Branch"
  }
}', 0)
ON DUPLICATE KEY UPDATE updated_at = NOW();
