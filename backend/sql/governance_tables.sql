-- Governance reference tables for CARC/RARC mappings and claim action codes.
-- Safe to run on tenant databases; existing tables are extended rather than replaced.

CREATE TABLE IF NOT EXISTS carc (
  Code VARCHAR(16) NOT NULL PRIMARY KEY,
  Description TEXT NULL,
  DenialCategory VARCHAR(255) NULL,
  effective_year SMALLINT NULL,
  expires_on DATE NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_carc_active (is_active),
  INDEX idx_carc_expires_on (expires_on)
);

CREATE TABLE IF NOT EXISTS rarc (
  Code VARCHAR(16) NOT NULL PRIMARY KEY,
  Description TEXT NULL,
  DenialCategory VARCHAR(255) NULL,
  effective_year SMALLINT NULL,
  expires_on DATE NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_rarc_active (is_active),
  INDEX idx_rarc_expires_on (expires_on)
);

CREATE TABLE IF NOT EXISTS claim_action_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(255) NOT NULL,
  action_label VARCHAR(255) NOT NULL,
  allow_free_text TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  transaction_options TEXT NULL,
  tickle_time VARCHAR(64) NULL,
  effective_year SMALLINT NULL,
  expires_on DATE NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_claim_action_category (category),
  INDEX idx_claim_action_active (is_active),
  INDEX idx_claim_action_expires_on (expires_on)
);
