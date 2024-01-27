CREATE TABLE IF NOT EXISTS refresh_tokens (
    token_id BIGSERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(1024) NOT NULL,
    expiration_time TIMESTAMP NOT NULL,
    is_blacklisted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);