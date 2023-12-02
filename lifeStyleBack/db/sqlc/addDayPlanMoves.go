package db

import (
	"context"
	"database/sql"
	"log"
)

func NewDayPlanMoves(db *sql.DB) *QWithTx {
	return &QWithTx{
		db:      db,
		Queries: New(db),
	}
}

type DayPlanMovesTx struct {
	AddDayPlanTx      AddDayPlanParams
	AddDayPlanMovesTx []AddDayPlanMovesParams
}

func (qw *QWithTx) CreateDayPlanMoves(ctx context.Context, arg DayPlanMovesTx) (DayPlan, error) {
	var dayPlan DayPlan

	err := qw.execTx(ctx, func(q *Queries) error {
		var err error

		dayPlan, err = q.AddDayPlan(ctx, arg.AddDayPlanTx)
		if err != nil {
			log.Println("Failed to add DayPlan")
			return err
		}

		for _, eachMove := range arg.AddDayPlanMovesTx {
			var err error
			err = q.AddDayPlanMoves(ctx, eachMove)
			if err != nil {
				log.Println("Failed to add one of the DayPlanMoves")
				return err
			}
		}
		return nil
	})

	if err != nil {
		log.Println("Unexpected error in adding day plan and day plan moves")
		return dayPlan, err
	}

	return dayPlan, nil
}
