CREATE TABLE IF NOT EXISTS user_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    dob DATE NULL,
    current_organization VARCHAR(255) NULL,
    `current_role` VARCHAR(255) NULL,
    experience_years DECIMAL(5,2) NULL,
    linkedin_url VARCHAR(1024) NULL,
    github_url VARCHAR(1024) NULL,
    twitter_url VARCHAR(1024) NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
