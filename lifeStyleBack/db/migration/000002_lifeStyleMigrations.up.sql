CREATE TABLE budgets (
    budget_id BIGSERIAL PRIMARY KEY,
    user_id BIGSERIAL NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    savings DECIMAL(10,2) NOT NULL,
    capital DECIMAL(10,2) NOT NULL,
    eatout DECIMAL(10,2) NOT NULL,
    entertainment DECIMAL(10,2) NOT NULL,
    income DECIMAL(10,2) GENERATED ALWAYS AS (COALESCE(capital, 0) + COALESCE(eatout, 0) + COALESCE(entertainment, 0)) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
