CREATE TABLE users (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX user_email (email)
    );

CREATE TABLE budgets (
    budget_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    income DECIMAL(10,2) NOT NULL,
    savings DECIMAL(10,2),
    capital DECIMAL(10,2),
    eatout DECIMAL(10,2),
    entertainment DECIMAL(10,2),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX budget_idx (budget_id)
);

CREATE TABLE capital_expenses (
    capital_exp_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    budget_id BIGINT UNSIGNED,
    user_id BIGINT UNSIGNED,
    expenses DECIMAL(10,2) NOT NULL,
    description varchar(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (budget_id) REFERENCES budgets(budget_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX cap_expenses_idx (budget_id)
);

CREATE TABLE eatout_expenses (
    eatout_exp_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    budget_id BIGINT UNSIGNED,
    user_id BIGINT UNSIGNED,
    expenses DECIMAL(10,2) NOT NULL,
    description varchar(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (budget_id) REFERENCES budgets(budget_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX eat_expenses_idx (budget_id)
);

CREATE TABLE entertainment_expenses (
    entertainment_exp_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    budget_id BIGINT UNSIGNED,
    user_id BIGINT UNSIGNED,
    expenses DECIMAL(10,2) NOT NULL,
    description varchar(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (budget_id) REFERENCES budgets(budget_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX ent_expenses_idx (budget_id)
);

CREATE TABLE balance ( 
    balance_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT, 
    budget_id BIGINT UNSIGNED,
    user_id BIGINT UNSIGNED,
    capital DECIMAL(10,2),
    eatout DECIMAL(10,2),
    entertainment DECIMAL(10,2),
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (budget_id) REFERENCES budgets(budget_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX balance_idx (balance_id)
);

