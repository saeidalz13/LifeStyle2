CREATE TABLE plans (
    plan_id BIGSERIAL PRIMARY KEY, 
    user_id BIGSERIAL NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    days integer NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE plans
ADD CONSTRAINT unique_plan_name UNIQUE (user_id, plan_name);
