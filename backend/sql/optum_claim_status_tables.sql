-- Optum Medical Network Claim Status v2 (276/277) tables
-- Drafted from Optum Claim Status v2 OpenAPI schemas

CREATE TABLE optum_claim_status_request (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  control_number VARCHAR(20) NOT NULL,
  trading_partner_name VARCHAR(255),
  trading_partner_service_id VARCHAR(80),
  subscriber_member_id VARCHAR(80) NOT NULL,
  subscriber_first_name VARCHAR(60) NOT NULL,
  subscriber_last_name VARCHAR(60) NOT NULL,
  subscriber_gender VARCHAR(10),
  subscriber_dob DATE,
  dependent_first_name VARCHAR(60),
  dependent_last_name VARCHAR(60),
  dependent_gender VARCHAR(10),
  dependent_dob DATE,
  group_number VARCHAR(80),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  raw_json JSON,
  raw_x12 TEXT
);

CREATE TABLE optum_claim_status_request_provider (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT NOT NULL,
  provider_type VARCHAR(40) NOT NULL,
  organization_name VARCHAR(255),
  first_name VARCHAR(60),
  last_name VARCHAR(60),
  npi VARCHAR(20),
  spn VARCHAR(20),
  tin VARCHAR(20),
  tax_id VARCHAR(20),
  etin VARCHAR(20),
  FOREIGN KEY (request_id) REFERENCES optum_claim_status_request(id)
);

CREATE TABLE optum_claim_status_request_encounter (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT NOT NULL,
  beginning_date_of_service DATE,
  end_date_of_service DATE,
  tracking_number VARCHAR(50),
  trading_partner_claim_number VARCHAR(50),
  location_identifier VARCHAR(30),
  billing_type VARCHAR(10),
  patient_account_number VARCHAR(50),
  pharmacy_prescription_number VARCHAR(50),
  clearing_house_claim_number VARCHAR(50),
  submitted_amount VARCHAR(30),
  FOREIGN KEY (request_id) REFERENCES optum_claim_status_request(id)
);

CREATE TABLE optum_claim_status_request_service_line (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT NOT NULL,
  product_or_service_id_qualifier VARCHAR(10),
  procedure_code VARCHAR(20),
  procedure_modifiers VARCHAR(80),
  line_item_charge_amount VARCHAR(30),
  revenue_code VARCHAR(10),
  units_of_service_count VARCHAR(20),
  line_item_control_number VARCHAR(50),
  service_line_date DATE,
  service_line_end_date DATE,
  FOREIGN KEY (request_id) REFERENCES optum_claim_status_request(id)
);

CREATE TABLE optum_claim_status_response (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT,
  control_number VARCHAR(20),
  trading_partner_service_id VARCHAR(80),
  status VARCHAR(50),
  reassociation_key VARCHAR(80),
  transaction_set_acknowledgement VARCHAR(100),
  implementation_transaction_set_syntax_error VARCHAR(100),
  x12 MEDIUMTEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  raw_json JSON,
  FOREIGN KEY (request_id) REFERENCES optum_claim_status_request(id)
);

CREATE TABLE optum_claim_status_response_payer (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  response_id BIGINT NOT NULL,
  organization_name VARCHAR(255),
  payer_identification VARCHAR(60),
  cms_plan_id VARCHAR(60),
  contact_name VARCHAR(100),
  contact_electronic_data_interchange_access_number VARCHAR(60),
  contact_email VARCHAR(255),
  contact_fax VARCHAR(30),
  contact_phone VARCHAR(30),
  contact_phone_extension VARCHAR(20),
  FOREIGN KEY (response_id) REFERENCES optum_claim_status_response(id)
);

CREATE TABLE optum_claim_status_response_provider (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  response_id BIGINT NOT NULL,
  provider_type VARCHAR(40) NOT NULL,
  organization_name VARCHAR(255),
  first_name VARCHAR(60),
  last_name VARCHAR(60),
  npi VARCHAR(20),
  spn VARCHAR(20),
  tin VARCHAR(20),
  tax_id VARCHAR(20),
  etin VARCHAR(20),
  FOREIGN KEY (response_id) REFERENCES optum_claim_status_response(id)
);

CREATE TABLE optum_claim_status_response_member (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  response_id BIGINT NOT NULL,
  role VARCHAR(20) NOT NULL,
  member_id VARCHAR(80),
  first_name VARCHAR(60) NOT NULL,
  last_name VARCHAR(60) NOT NULL,
  gender VARCHAR(10),
  date_of_birth DATE,
  group_number VARCHAR(80),
  FOREIGN KEY (response_id) REFERENCES optum_claim_status_response(id)
);

CREATE TABLE optum_claim_status_claim (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  response_id BIGINT NOT NULL,
  claim_index INT NOT NULL,
  status_category_code VARCHAR(10),
  status_category_code_value VARCHAR(120),
  status_code VARCHAR(10),
  status_code_value VARCHAR(120),
  entity_code VARCHAR(10),
  entity VARCHAR(120),
  effective_date DATE,
  submitted_amount VARCHAR(30),
  amount_paid VARCHAR(30),
  paid_date DATE,
  check_issue_date DATE,
  check_number VARCHAR(30),
  tracking_number VARCHAR(50),
  claim_service_date DATE,
  trading_partner_claim_number VARCHAR(50),
  patient_account_number VARCHAR(50),
  clearing_house_claim_number VARCHAR(50),
  insight_status VARCHAR(20),
  FOREIGN KEY (response_id) REFERENCES optum_claim_status_response(id)
);

CREATE TABLE optum_claim_status_service (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  claim_id BIGINT NOT NULL,
  service_id_qualifier_code VARCHAR(10),
  service_id_qualifier VARCHAR(30),
  procedure_id VARCHAR(30),
  submitted_amount VARCHAR(30),
  amount_paid VARCHAR(30),
  revenue_code VARCHAR(10),
  submitted_units VARCHAR(20),
  FOREIGN KEY (claim_id) REFERENCES optum_claim_status_claim(id)
);

CREATE TABLE optum_claim_status_service_status (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  service_id BIGINT NOT NULL,
  status_category_code VARCHAR(10),
  status_category_code_value VARCHAR(120),
  status_code VARCHAR(10),
  status_code_value VARCHAR(120),
  entity_code VARCHAR(10),
  entity VARCHAR(120),
  effective_date DATE,
  FOREIGN KEY (service_id) REFERENCES optum_claim_status_service(id)
);

CREATE TABLE optum_claim_status_error (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  response_id BIGINT NOT NULL,
  code VARCHAR(30),
  description VARCHAR(255),
  customer_transaction_id VARCHAR(80),
  transaction_id VARCHAR(80),
  FOREIGN KEY (response_id) REFERENCES optum_claim_status_response(id)
);

CREATE TABLE optum_claim_status_error_detail (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  error_id BIGINT NOT NULL,
  field VARCHAR(80),
  value VARCHAR(255),
  code VARCHAR(30),
  description VARCHAR(255),
  location VARCHAR(80),
  followup_action VARCHAR(80),
  FOREIGN KEY (error_id) REFERENCES optum_claim_status_error(id)
);

CREATE TABLE optum_claim_status_meta (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  response_id BIGINT NOT NULL,
  submitter_id VARCHAR(80),
  sender_id VARCHAR(80),
  biller_id VARCHAR(80),
  trace_id VARCHAR(80),
  application_mode VARCHAR(30),
  FOREIGN KEY (response_id) REFERENCES optum_claim_status_response(id)
);
