-- name: AddCapitalExpense :exec
INSERT INTO capital_expenses (
    budget_id,
    user_id,
    expenses,
    description
)   VALUES (
    $1, $2, $3, $4
);

-- name: AddEatoutExpense :exec
INSERT INTO eatout_expenses (
    budget_id,
    user_id,
    expenses,
    description
)   VALUES (
    $1, $2, $3, $4
);

-- name: AddEntertainmentExpense :exec
INSERT INTO entertainment_expenses (
    budget_id,
    user_id,
    expenses,
    description
)   VALUES (
    $1, $2, $3, $4
);