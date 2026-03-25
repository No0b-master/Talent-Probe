CREATE TABLE IF NOT EXISTS payment_audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    transaction_ref VARCHAR(64) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    plan_code VARCHAR(32) NULL,
    plan_name VARCHAR(64) NULL,
    amount_usd DECIMAL(10,2) NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    status VARCHAR(32) NOT NULL,
    payment_provider VARCHAR(64) NOT NULL DEFAULT 'internal_mock',
    payment_method VARCHAR(64) NULL,
    invoice_storage_provider VARCHAR(32) NULL,
    invoice_storage_key VARCHAR(512) NULL,
    invoice_file_url TEXT NULL,
    error_message TEXT NULL,
    metadata_json LONGTEXT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_payment_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE INDEX idx_payment_audit_logs_user_created_at
    ON payment_audit_logs (user_id, created_at);

CREATE INDEX idx_payment_audit_logs_status_created_at
    ON payment_audit_logs (status, created_at);
