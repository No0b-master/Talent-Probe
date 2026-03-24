CREATE TABLE IF NOT EXISTS professions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    profession_name VARCHAR(255) NOT NULL UNIQUE,
    uae_context VARCHAR(1024) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX idx_professions_active_sort (is_active, sort_order, profession_name)
) ENGINE=InnoDB;
