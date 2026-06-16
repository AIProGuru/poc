CREATE TABLE IF NOT EXISTS appeal_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  stored_path VARCHAR(512) NOT NULL,
  mime_type VARCHAR(128) DEFAULT NULL,
  file_size BIGINT DEFAULT NULL,
  notes TEXT,
  transmission_method VARCHAR(255) DEFAULT NULL,
  uploaded_by VARCHAR(128) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appeal_template_payer_ids (
  id INT AUTO_INCREMENT PRIMARY KEY,
  template_id INT NOT NULL,
  payer_id_835 VARCHAR(80) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_template_payer (template_id, payer_id_835),
  INDEX idx_payer_id_835 (payer_id_835),
  CONSTRAINT fk_appeal_template_payer_template
    FOREIGN KEY (template_id) REFERENCES appeal_templates(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payer_appeal_contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payer_id_835 VARCHAR(80) NOT NULL,
  payer_name VARCHAR(255) DEFAULT NULL,
  address TEXT,
  phone VARCHAR(80) DEFAULT NULL,
  fax VARCHAR(80) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_payer_contact_835 (payer_id_835)
);
