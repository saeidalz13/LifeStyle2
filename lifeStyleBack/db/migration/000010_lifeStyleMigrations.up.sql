CREATE TABLE day_plan_moves (
    day_plan_move_id BIGSERIAL PRIMARY KEY, 
    user_id BIGSERIAL NOT NULL,
    plan_id BIGSERIAL NOT NULL,
    move_id BIGSERIAL NOT NULL, 
    sets integer NOT NULL,
    reps integer NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id) ON DELETE CASCADE,
    FOREIGN KEY (move_id) REFERENCES moves(move_id) ON DELETE CASCADE
);
