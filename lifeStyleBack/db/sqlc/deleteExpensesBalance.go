package db

import (
	"context"
	"log"

	"github.com/shopspring/decimal"
)

func (qw *QWithTx) DeleteCapitalExpenseBalance(ctx context.Context, arg *DeleteSingleCapitalExpenseParams) error {
	err := qw.execTx(ctx, func(q *Queries) error {
		deletedExpense, err := q.DeleteSingleCapitalExpense(ctx, *arg)
		if err != nil {
			return nil
		}
		deletedExpenseAmout, err := decimal.NewFromString(deletedExpense.Expenses)
		if err != nil {
			return nil
		}

		oldBalance, err := q.SelectBalance(ctx, SelectBalanceParams{
			UserID:   arg.UserID,
			BudgetID: deletedExpense.BudgetID,
		})
		if err != nil {
			return err
		}
		oldBalanceAmount, err := decimal.NewFromString(oldBalance.Capital)
		if err != nil {
			return err
		}

		newBalance := oldBalanceAmount.Add(deletedExpenseAmout)

		updatedBalance, err := q.UpdateCapitalBalance(ctx, UpdateCapitalBalanceParams{
			Capital:  newBalance.String(),
			UserID:   arg.UserID,
			BudgetID: deletedExpense.BudgetID,
		})
		if err != nil {
			return err
		}

		log.Println(updatedBalance)
		return nil

	})

	if err != nil {
		return err
	}
	return nil
}
