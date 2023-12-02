CREATE TABLE move_types (
    move_type_id BIGSERIAL PRIMARY KEY,
    move_type VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE moves (
    move_id BIGSERIAL PRIMARY KEY,
    move_name VARCHAR(255) NOT NULL UNIQUE,
    move_type_id BIGSERIAL NOT NULL,
    FOREIGN KEY (move_type_id) REFERENCES move_types(move_type_id) ON DELETE CASCADE
);