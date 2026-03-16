CREATE TABLE IF NOT EXISTS user_resumes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(16) NOT NULL,
    storage_provider VARCHAR(32) NOT NULL,
    storage_key VARCHAR(1024) NOT NULL,
    file_url VARCHAR(2048) NULL,
    extracted_text LONGTEXT NOT NULL,
    character_count INT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_resumes_user_created (user_id, created_at)
) ENGINE=InnoDB;
