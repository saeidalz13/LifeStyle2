package db

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

// Composition instead of inheritence
type BudgetBalance struct {
	*Queries
	db *sql.DB
}

func NewBudgetBalance(db *sql.DB) *BudgetBalance {
	return &BudgetBalance{
		db:      db,
		Queries: New(db),
	}
}

func (bb *BudgetBalance) execTx(ctx context.Context, fn func(*Queries) error) error {
	// Second arg is a custom isolation level
	tx, err := bb.db.BeginTx(ctx, nil)
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

type CreateBudgetBalanceTx struct {
	UserID        int64          `json:"user_id"`
	StartDate     time.Time      `json:"start_date"`
	EndDate       time.Time      `json:"end_date"`
	Income        string         `json:"income"`
	Savings       string `json:"savings"`
	Capital       string `json:"capital"`
	Eatout        string `json:"eatout"`
	Entertainment string `json:"entertainment"`
}

type BalanceBudgetResultTx struct {
	BudgetRes  Budget
	BalanceRes Balance
}

func (bb *BudgetBalance) CreateBudgetBalance(ctx context.Context, arg CreateBudgetBalanceTx) (BalanceBudgetResultTx, error) {
	var createBudget BalanceBudgetResultTx

	err := bb.execTx(ctx, func(q *Queries) error {
		var err error
		createBudget.BudgetRes, err = q.CreateBudget(ctx, CreateBudgetParams{
			UserID:        arg.UserID,
			StartDate:     arg.StartDate,
			EndDate:       arg.EndDate,
			Income:        arg.Income,
			Savings:       arg.Savings,
			Capital:       arg.Capital,
			Eatout:        arg.Eatout,
			Entertainment: arg.Entertainment,
		})
		if err != nil {
			return err
		}

		createBudget.BalanceRes, err = q.CreateBalance(ctx, CreateBalanceParams{
			BudgetID:      createBudget.BudgetRes.BudgetID,
			UserID:        arg.UserID,
			Capital:       arg.Capital,
			Eatout:        arg.Eatout,
			Entertainment: arg.Entertainment,
		})

		if err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		return createBudget, err
	}

	return createBudget, nil
}
