CREATE TABLE IF NOT EXISTS appeal_agent_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  claim_no VARCHAR(64) NOT NULL,
  letter_text MEDIUMTEXT,
  clinical_summary TEXT,
  appeal_argument MEDIUMTEXT,
  denial_reason TEXT,
  supporting_docs_json TEXT,
  messages_json MEDIUMTEXT,
  populated_json MEDIUMTEXT,
  used_llm TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_appeal_agent_claim_no (claim_no)
);
