package db

import (
	"context"
	"log"

	"github.com/shopspring/decimal"
)

type IncomingUpdateExpenses struct {
	Expenses    string `json:"expenses"`
	Description string `json:"description"`
}

type IncomingUpdateCapitalExpenses struct {
	IncomingUpdateExpenses
	CapitalExpID int64 `json:"capital_exp_id"`
}

type IncomingUpdateEatoutExpenses struct {
	IncomingUpdateExpenses
	EatoutExpID int64 `json:"eatout_exp_id"`
}

type IncomingUpdateEntertainmentExpenses struct {
	IncomingUpdateExpenses
	EntertainmentExpID int64 `json:"entertainment_exp_id"`
}

type ExpenseBalanceEntertainment struct {
	IncomingUpdateEntertainmentExpenses
	UserId int64
}

type ExpenseBalanceCapital struct {
	IncomingUpdateCapitalExpenses
	UserId int64
}

type ExpenseBalanceEatout struct {
	IncomingUpdateEatoutExpenses
	UserId int64
}

func (qw *QWithTx) UpdateExpensesBalanceEntertainment(ctx context.Context, arg *ExpenseBalanceEntertainment) error {
	err := qw.execTx(ctx, func(q *Queries) error {
		oldEntertainmentExpense, err := q.FetchSingleEntertainmentExpense(ctx, arg.EntertainmentExpID)
		if err != nil {
			return err
		}
		oldExpenseAmount, err := decimal.NewFromString(oldEntertainmentExpense.Expenses)
		if err != nil {
			return err
		}
		newExpenseAmount, err := decimal.NewFromString(arg.Expenses)
		if err != nil {
			return err
		}

		updatedExpense, err := q.UpdateEntertainmentExpenses(ctx, UpdateEntertainmentExpensesParams{
			Expenses:           arg.Expenses,
			Description:        arg.Description,
			EntertainmentExpID: arg.EntertainmentExpID,
			UserID:             arg.UserId,
		})

		if err != nil {
			return err
		}

		oldEntertainment, err := q.SelectEntertainmentBalance(ctx, SelectEntertainmentBalanceParams{
			UserID:   arg.UserId,
			BudgetID: updatedExpense.BudgetID,
		})
		if err != nil {
			return err
		}

		oldBalanceAmount, err := decimal.NewFromString(oldEntertainment)
		if err != nil {
			return err
		}
		expenseDifference := newExpenseAmount.Sub(oldExpenseAmount)
		newBalance := oldBalanceAmount.Sub(expenseDifference)

		updatedBalance, err := q.UpdateEntertainmentBalance(ctx, UpdateEntertainmentBalanceParams{
			Entertainment: newBalance.String(),
			UserID:        arg.UserId,
			BudgetID:      updatedExpense.BudgetID,
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

func (qw *QWithTx) UpdateExpensesBalanceCapital(ctx context.Context, arg *ExpenseBalanceCapital) error {
	err := qw.execTx(ctx, func(q *Queries) error {
		oldCapitalExpense, err := q.FetchSingleCapitalExpense(ctx, arg.CapitalExpID)
		if err != nil {
			return err
		}
		oldExpenseAmount, err := decimal.NewFromString(oldCapitalExpense.Expenses)
		if err != nil {
			return err
		}
		newExpenseAmount, err := decimal.NewFromString(arg.Expenses)
		if err != nil {
			return err
		}

		updatedExpense, err := q.UpdateCapitalExpenses(ctx, UpdateCapitalExpensesParams{
			Expenses:     arg.Expenses,
			Description:  arg.Description,
			CapitalExpID: arg.CapitalExpID,
			UserID:       arg.UserId,
		})

		if err != nil {
			return err
		}

		oldCapital, err := q.SelectCapitalBalance(ctx, SelectCapitalBalanceParams{
			UserID:   arg.UserId,
			BudgetID: updatedExpense.BudgetID,
		})
		if err != nil {
			return err
		}

		oldBalanceAmount, err := decimal.NewFromString(oldCapital)
		if err != nil {
			return err
		}
		expenseDifference := newExpenseAmount.Sub(oldExpenseAmount)
		newBalance := oldBalanceAmount.Sub(expenseDifference)

		updatedBalance, err := q.UpdateCapitalBalance(ctx, UpdateCapitalBalanceParams{
			Capital:  newBalance.String(),
			UserID:   arg.UserId,
			BudgetID: updatedExpense.BudgetID,
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

func (qw *QWithTx) UpdateExpensesBalanceEatout(ctx context.Context, arg *ExpenseBalanceEatout) error {
	err := qw.execTx(ctx, func(q *Queries) error {
		oldEatoutExpense, err := q.FetchSingleEatoutExpense(ctx, arg.EatoutExpID)
		if err != nil {
			return err
		}
		oldExpenseAmount, err := decimal.NewFromString(oldEatoutExpense.Expenses)
		if err != nil {
			return err
		}
		newExpenseAmount, err := decimal.NewFromString(arg.Expenses)
		if err != nil {
			return err
		}

		updatedExpense, err := q.UpdateEatoutExpenses(ctx, UpdateEatoutExpensesParams{
			Expenses:    arg.Expenses,
			Description: arg.Description,
			EatoutExpID: arg.EatoutExpID,
			UserID:      arg.UserId,
		})

		if err != nil {
			return err
		}


		oldEatout, err := q.SelectEatoutBalance(ctx, SelectEatoutBalanceParams{
			UserID:   arg.UserId,
			BudgetID: updatedExpense.BudgetID,
		})
		if err != nil {
			return err
		}

		oldBalanceAmount, err := decimal.NewFromString(oldEatout)
		if err != nil {
			return err
		}
		expenseDifference := newExpenseAmount.Sub(oldExpenseAmount)
		newBalance := oldBalanceAmount.Sub(expenseDifference)

		if err = q.UpdateEatoutBalance(ctx, UpdateEatoutBalanceParams{
			Eatout:   newBalance.String(),
			UserID:   arg.UserId,
			BudgetID: updatedExpense.BudgetID,
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
