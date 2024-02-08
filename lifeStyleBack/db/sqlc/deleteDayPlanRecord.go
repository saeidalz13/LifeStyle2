package db

import (
	"context"
	"log"
)

func (qw *QWithTx) DeleteDayPlanRecord(ctx context.Context, userId, dayPlanMoveId int64) error {
	err := qw.execTx(ctx, func(q *Queries) error {
		deletedDayPlanMove, err := q.DeleteFitnessDayPlanMove(ctx, DeleteFitnessDayPlanMoveParams{
			UserID:        userId,
			DayPlanMoveID: int64(dayPlanMoveId),
		})
		if err != nil {
			log.Println("DeleteFitnessDayPlanMove failure:", err)
			return err
		}
		numDayPlanMoves, err := q.CountFitnessDayPlanMoves(ctx, CountFitnessDayPlanMovesParams{
			UserID:    userId,
			DayPlanID: deletedDayPlanMove.DayPlanID,	
		})
		if err != nil {
			log.Println("CountFitnessDayPlanMoves failure:", err)
			return err
		}
	
		if numDayPlanMoves == 0 {
			if err := q.DeleteFitnessDayPlan(ctx, DeleteFitnessDayPlanParams{
				UserID:    userId,
				DayPlanID: deletedDayPlanMove.DayPlanID,
			}); err != nil {
				log.Println(err)
				return err
			}
		}
		return nil
	})

	if err != nil {
		return err
	}
	return nil
}
