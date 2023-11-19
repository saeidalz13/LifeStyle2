CREATE TABLE capital_expenses (
    capital_exp_id BIGSERIAL PRIMARY KEY,
    budget_id BIGSERIAL NOT NULL,
    user_id BIGSERIAL NOT NULL,
    expenses DECIMAL(10,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (budget_id) REFERENCES budgets(budget_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);