CREATE TABLE balance ( 
    balance_id BIGSERIAL PRIMARY KEY, 
    budget_id BIGSERIAL NOT NULL,
    user_id BIGSERIAL NOT NULL,
    capital DECIMAL(10,2) NOT NULL,
    eatout DECIMAL(10,2) NOT NULL,
    entertainment DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) GENERATED ALWAYS AS (COALESCE(capital, 0) + COALESCE(eatout, 0) + COALESCE(entertainment, 0)) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (budget_id) REFERENCES budgets(budget_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);