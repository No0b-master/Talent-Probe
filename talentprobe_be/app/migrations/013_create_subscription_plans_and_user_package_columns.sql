CREATE TABLE IF NOT EXISTS subscription_plans (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    plan_code VARCHAR(32) NOT NULL UNIQUE,
    plan_name VARCHAR(64) NOT NULL,
    daily_limit INT NOT NULL,
    price_usd DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    duration_days INT NOT NULL DEFAULT 30,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
) ENGINE=InnoDB;

INSERT INTO subscription_plans (plan_code, plan_name, daily_limit, price_usd, duration_days, sort_order, is_active, created_at, updated_at)
VALUES
    ('basic', 'Basic', 3, 0.00, 30, 10, 1, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
    ('plus', 'Plus', 5, 49.00, 30, 20, 1, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
    ('prime', 'Prime', 10, 99.00, 30, 30, 1, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
    ('ultra', 'Ultra', 15, 139.00, 30, 40, 1, UTC_TIMESTAMP(), UTC_TIMESTAMP())
ON DUPLICATE KEY UPDATE
    plan_name = VALUES(plan_name),
    daily_limit = VALUES(daily_limit),
    price_usd = VALUES(price_usd),
    duration_days = VALUES(duration_days),
    sort_order = VALUES(sort_order),
    is_active = VALUES(is_active),
    updated_at = UTC_TIMESTAMP();

ALTER TABLE users
    ADD COLUMN current_plan_code VARCHAR(32) NOT NULL DEFAULT 'basic',
    ADD COLUMN plan_started_at DATETIME NULL,
    ADD COLUMN plan_expires_at DATETIME NULL;

ALTER TABLE users
    MODIFY COLUMN daily_scan_limit INT NOT NULL DEFAULT 3;

UPDATE users
SET
    current_plan_code = 'basic',
    daily_scan_limit = 3,
    plan_started_at = COALESCE(plan_started_at, UTC_TIMESTAMP())
WHERE current_plan_code IS NULL OR current_plan_code = '';
