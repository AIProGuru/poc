CREATE TABLE IF NOT EXISTS appeal_supporting_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  claim_no VARCHAR(64) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(64) NOT NULL,
  stored_path VARCHAR(512) NOT NULL,
  mime_type VARCHAR(128) DEFAULT NULL,
  file_size BIGINT DEFAULT NULL,
  uploaded_by VARCHAR(128) DEFAULT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  source VARCHAR(32) DEFAULT 'manual',
  INDEX idx_appeal_docs_claim_no (claim_no)
);
