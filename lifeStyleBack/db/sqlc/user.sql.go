// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.23.0
// source: user.sql

package db

import (
	"context"
)

const createUser = `-- name: CreateUser :one
INSERT INTO users (
  email,
  password
)	VALUES (
	$1, $2
) RETURNING id, email, password, created_at
`

type CreateUserParams struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (q *Queries) CreateUser(ctx context.Context, arg CreateUserParams) (User, error) {
	row := q.db.QueryRowContext(ctx, createUser, arg.Email, arg.Password)
	var i User
	err := row.Scan(
		&i.ID,
		&i.Email,
		&i.Password,
		&i.CreatedAt,
	)
	return i, err
}

const deleteUser = `-- name: DeleteUser :exec
DELETE FROM users WHERE email = $1
`

func (q *Queries) DeleteUser(ctx context.Context, email string) error {
	_, err := q.db.ExecContext(ctx, deleteUser, email)
	return err
}

const selectUser = `-- name: SelectUser :one
SELECT id, email, password, created_at FROM users
WHERE email = $1 LIMIT 1
`

func (q *Queries) SelectUser(ctx context.Context, email string) (User, error) {
	row := q.db.QueryRowContext(ctx, selectUser, email)
	var i User
	err := row.Scan(
		&i.ID,
		&i.Email,
		&i.Password,
		&i.CreatedAt,
	)
	return i, err
}
