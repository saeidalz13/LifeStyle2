package db

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
)

// Composition instead of inheritence
type QWithTx struct {
	*Queries
	db *sql.DB
}

func NewBudgetBalance(db *sql.DB) *QWithTx {
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

type CreateBudgetBalanceTx struct {
	UserID        int64     `json:"user_id"`
	StartDate     time.Time `json:"start_date"`
	EndDate       time.Time `json:"end_date"`
	Savings       string    `json:"savings"`
	Capital       string    `json:"capital"`
	Eatout        string    `json:"eatout"`
	Entertainment string    `json:"entertainment"`
}

type BalanceBudgetResultTx struct {
	BudgetRes  Budget
	BalanceRes Balance
}

func (qw *QWithTx) CreateBudgetBalance(ctx context.Context, arg CreateBudgetBalanceTx) (BalanceBudgetResultTx, error) {
	var createBudget BalanceBudgetResultTx

	err := qw.execTx(ctx, func(q *Queries) error {
		var err error
		createBudget.BudgetRes, err = q.CreateBudget(ctx, CreateBudgetParams{
			UserID:        arg.UserID,
			StartDate:     arg.StartDate,
			EndDate:       arg.EndDate,
			Savings:       arg.Savings,
			Capital:       arg.Capital,
			Eatout:        arg.Eatout,
			Entertainment: arg.Entertainment,
		})
		if err != nil {
			log.Println("Error in creating new budget")
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
			log.Println("Error in creating new balance")
			return err
		}
		return nil
	})
	if err != nil {
		return createBudget, err
	}
	return createBudget, nil
}

type UpdateBudgetBalanceTx struct {
	Savings       string `json:"savings"`
	Capital       string `json:"capital"`
	Eatout        string `json:"eatout"`
	Entertainment string `json:"entertainment"`
	BudgetID      int64  `json:"budget_id"`
	UserID        int64  `json:"user_id"`
}

func (qw *QWithTx) UpdateBudgetBalance(ctx context.Context, arg UpdateBudgetBalanceTx) (Budget, Balance, error) {
	var updatedBudget Budget
	var updateBalance Balance

	err := qw.execTx(ctx, func(q *Queries) error {
		var err error
		updatedBudget, err = q.UpdateBudget(ctx, UpdateBudgetParams{
			Savings:       arg.Savings,
			Capital:       arg.Capital,
			Eatout:        arg.Eatout,
			Entertainment: arg.Entertainment,
			BudgetID:      arg.BudgetID,
			UserID:        arg.UserID,
		})
		if err != nil {
			log.Println("Error in updating new budget")
			return err
		}

		updateBalance, err = q.UpdateBalance(ctx, UpdateBalanceParams{
			Capital:       arg.Capital,
			Eatout:        arg.Eatout,
			Entertainment: arg.Entertainment,
			UserID:        arg.UserID,
			BudgetID:      arg.BudgetID,
		})
		if err != nil {
			log.Println("Error in updating new balance")
			return err
		}

		return nil
	})
	if err != nil {
		return updatedBudget, updateBalance, err
	}
	return updatedBudget, updateBalance, nil
}

type AddExpenseUpdateBalanceTx struct {
	BudgetID    int64  `json:"budget_id"`
	UserID      int64  `json:"user_id"`
	Expenses    string `json:"expenses"`
	Description string `json:"description"`
	ExpenseType  string `json:"budget_type"`
}

func (qw *QWithTx) AddExpenseUpdateBalance(ctx context.Context, arg AddExpenseUpdateBalanceTx) (Balance, error) {
	var updatedBalance Balance
	err := qw.execTx(ctx, func(q *Queries) error {
		var err error
		var updateBalanceParams UpdateBalanceParams
		updateBalanceParams.BudgetID = arg.BudgetID
		updateBalanceParams.UserID = arg.UserID

		if arg.ExpenseType == cn.ExpenseTypes.Capital {
			updateBalanceParams.Capital = "-" + arg.Expenses
			updateBalanceParams.Eatout = "0"
			updateBalanceParams.Entertainment = "0"

			if err = q.AddCapitalExpense(ctx, AddCapitalExpenseParams{
				BudgetID:    arg.BudgetID,
				UserID:      arg.UserID,
				Expenses:    arg.Expenses,
				Description: arg.Description,
			}); err != nil {
				log.Println("Failed to add the capital expenses")
				return err
			}
		} else if arg.ExpenseType == cn.ExpenseTypes.Eatout {
			updateBalanceParams.Capital = "0"
			updateBalanceParams.Eatout = "-" + arg.Expenses
			updateBalanceParams.Entertainment = "0"

			if err = q.AddEatoutExpense(ctx, AddEatoutExpenseParams{
				BudgetID:    arg.BudgetID,
				UserID:      arg.UserID,
				Expenses:    arg.Expenses,
				Description: arg.Description,
			}); err != nil {
				log.Println("Failed to add the eatout expenses")
				return err
			}
		} else if arg.ExpenseType == cn.ExpenseTypes.Entertainment {
			updateBalanceParams.Capital = "0"
			updateBalanceParams.Eatout = "0"
			updateBalanceParams.Entertainment = "-" + arg.Expenses

			if err = q.AddEntertainmentExpense(ctx, AddEntertainmentExpenseParams{
				BudgetID:    arg.BudgetID,
				UserID:      arg.UserID,
				Expenses:    arg.Expenses,
				Description: arg.Description,
			}); err != nil {
				log.Println("Failed to add the entertainment expenses")
				return err
			}
		} else {
			return fmt.Errorf("Invalid type of budget requested!")
		}

		updatedBalance, err = q.UpdateBalance(ctx, updateBalanceParams)
		if err != nil {
			log.Println("Failed to update the balance after updating the expense")
			return err
		}
		return nil
	})

	if err != nil {
		log.Println("Failed to do the expense adding transaction")
		return updatedBalance, err
	}
	return updatedBalance, nil
}
