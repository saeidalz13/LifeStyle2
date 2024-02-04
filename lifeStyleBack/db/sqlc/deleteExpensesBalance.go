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
		deletedExpenseAmount, err := decimal.NewFromString(deletedExpense.Expenses)
		if err != nil {
			return nil
		}

		oldCapital, err := q.SelectCapitalBalance(ctx, SelectCapitalBalanceParams{
			UserID:   arg.UserID,
			BudgetID: deletedExpense.BudgetID,
		})
		if err != nil {
			return err
		}
		oldBalanceAmount, err := decimal.NewFromString(oldCapital)
		if err != nil {
			return err
		}

		newBalance := oldBalanceAmount.Add(deletedExpenseAmount)

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

func (qw *QWithTx) DeleteEatoutExpenseBalance(ctx context.Context, arg *DeleteSingleEatoutExpenseParams) error {
	err := qw.execTx(ctx, func(q *Queries) error {
		deletedExpense, err := q.DeleteSingleEatoutExpense(ctx, *arg)
		if err != nil {
			return nil
		}
		deletedExpenseAmount, err := decimal.NewFromString(deletedExpense.Expenses)
		if err != nil {
			return nil
		}

		oldEatout, err := q.SelectEatoutBalance(ctx, SelectEatoutBalanceParams{
			UserID:   arg.UserID,
			BudgetID: deletedExpense.BudgetID,
		})
		if err != nil {
			return err
		}
		oldBalanceAmount, err := decimal.NewFromString(oldEatout)
		if err != nil {
			return err
		}

		newBalance := oldBalanceAmount.Add(deletedExpenseAmount)

		if err = q.UpdateEatoutBalance(ctx, UpdateEatoutBalanceParams{
			Eatout:   newBalance.String(),
			UserID:   arg.UserID,
			BudgetID: deletedExpense.BudgetID,
		}); err != nil {
			return err
		}

		return nil

	})

	if err != nil {
		return err
	}
	return nil
}

func (qw *QWithTx) DeleteEntertainmentExpenseBalance(ctx context.Context, arg *DeleteSingleEntertainmentExpenseParams) error {
	err := qw.execTx(ctx, func(q *Queries) error {
		deletedExpense, err := q.DeleteSingleEntertainmentExpense(ctx, *arg)
		if err != nil {
			return nil
		}
		deletedExpenseAmount, err := decimal.NewFromString(deletedExpense.Expenses)
		if err != nil {
			return nil
		}

		oldEntertainment, err := q.SelectEntertainmentBalance(ctx, SelectEntertainmentBalanceParams{
			UserID:   arg.UserID,
			BudgetID: deletedExpense.BudgetID,
		})
		if err != nil {
			return err
		}
		oldBalanceAmount, err := decimal.NewFromString(oldEntertainment)
		if err != nil {
			return err
		}

		newBalance := oldBalanceAmount.Add(deletedExpenseAmount)

		updatedBalance, err := q.UpdateEntertainmentBalance(ctx, UpdateEntertainmentBalanceParams{
			Entertainment: newBalance.String(),
			UserID:        arg.UserID,
			BudgetID:      deletedExpense.BudgetID,
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
