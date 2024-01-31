package db

import (
	"context"
	"database/sql"
	"fmt"
)

// Composition instead of inheritence
type QWithTx struct {
	*Queries
	db *sql.DB
}

func NewQWithTx(db *sql.DB) *QWithTx {
	return &QWithTx{
		db:      db,
		Queries: New(db),
	}
}

func (qw *QWithTx) execTx(ctx context.Context, fn func(*Queries) error) error {
	// Second arg is a custom isolation level
	tx, err := qw.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	q := New(tx)
	if err = fn(q); err != nil {
		if rbErr := tx.Rollback(); rbErr != nil {
			return fmt.Errorf("TX Error: %v | Function Error: %v", rbErr, err)
		}
		return err
	}
	return tx.Commit()
}
