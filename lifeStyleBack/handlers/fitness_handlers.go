package handlers

import (
	"context"
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	database "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db"
	sqlc "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/models"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/utils"
)

func GetAllFitnessPlans(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()

	// User Authorization
	userEmail, err := utils.ExtractEmailFromClaim(ftx)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	q := sqlc.New(database.DB)
	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		log.Println("GetAllFitnessPlans: Select User Section", err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	plans, err := q.FetchFitnessPlans(ctx, user.ID)
	if err != nil {
		log.Println("GetAllFitnessPlans: Fetch Fitness Plans section", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to fetch fitness plans"})
	}

	log.Printf("%#v", plans)
	return ftx.Status(fiber.StatusOK).JSON(map[string]interface{}{"plans": plans})
}

func GetAllFitnessDayPlans(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(database.DB)

	// User Authorization
	userEmail, err := utils.ExtractEmailFromClaim(ftx)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}
	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	// Extract Plan ID
	idString := ftx.Params("id")
	planId, err := utils.FetchIntOfParamId(idString)
	if err != nil {
		log.Println("GetAllFitnessDayPlans: FetchIntOfParamId section", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ExtractUrlParam})
	}

	dayPlans, err := q.FetchFitnessDayPlans(ctx, sqlc.FetchFitnessDayPlansParams{
		UserID: user.ID,
		PlanID: int64(planId),
	})
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to fetch data"})
	}

	log.Println("Day Plans found; sending to frontend...")
	return ftx.Status(fiber.StatusOK).JSON(map[string]interface{}{"day_plans": dayPlans})
}

func GetAllFitnessDayPlanMoves(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(database.DB)

	// User Authorization
	userEmail, err := utils.ExtractEmailFromClaim(ftx)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}
	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	// Extract Plan ID
	idString := ftx.Params("id")
	planId, err := utils.FetchIntOfParamId(idString)
	if err != nil {
		log.Println("GetAllFitnessDayPlanMoves: FetchIntOfParamId section", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ExtractUrlParam})
	}

	joinedData, err := q.JoinDayPlanAndDayPlanMovesAndMoves(ctx)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to join day_plans and day_plan_moves"})
	}

	var moves []models.RespMoves
	for _, row := range joinedData {
		if row.PlanID == int64(planId) && row.UserID == user.ID {
			moveObj := models.RespMoves{}
			moveObj.Day = row.Day
			moveObj.DayPlanId = row.DayPlanID
			moveObj.DayPlanMoveId = row.DayPlanMoveID
			moveObj.MoveName = row.MoveName
			moveObj.Days = row.Days
			moveObj.PlanId = row.PlanID
			moves = append(moves, moveObj)
		}
	}

	log.Printf("%#v", moves)
	return ftx.Status(fiber.StatusOK).JSON(map[string]interface{}{"day_plan_moves": moves})
}

func GetSinglePlan(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(database.DB)

	// User Authorization
	userEmail, err := utils.ExtractEmailFromClaim(ftx)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}
	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}
	// Extract Plan ID
	idString := ftx.Params("id")
	planId, err := utils.FetchIntOfParamId(idString)
	if err != nil {
		log.Println("GetSinglePlan: FetchIntOfParamId section", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ExtractUrlParam})
	}

	plan, err := q.FetchSingleFitnessPlan(ctx, sqlc.FetchSingleFitnessPlanParams{
		UserID: user.ID,
		PlanID: int64(planId),
	})
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to fetch single plan"})
	}
	return ftx.Status(fiber.StatusOK).JSON(plan)
}

func GetAllFitnessDayPlanMovesWorkout(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(database.DB)

	// User Authorization
	userEmail, err := utils.ExtractEmailFromClaim(ftx)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}
	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	// Extract Day Plan ID
	idString := ftx.Params("id")
	dayPlanId, err := utils.FetchIntOfParamId(idString)
	if err != nil {
		log.Println("GetSinglePlan: FetchIntOfParamId section", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ExtractUrlParam})
	}

	dayPlanMoves, err := q.FetchFitnessDayPlanMoves(ctx, sqlc.FetchFitnessDayPlanMovesParams{
		UserID:    user.ID,
		DayPlanID: int64(dayPlanId),
	})
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to fetch all day plan moves"})
	}

	var moves []models.RespStartWorkoutDayPlanMoves
	for _, row := range dayPlanMoves {
		moveName, err := q.FetchMoveName(ctx, row.MoveID)
		if err != nil {
			return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ExtractMoveName})
		}
		moves = append(moves, models.RespStartWorkoutDayPlanMoves{
			DayPlanMoveID: row.DayPlanMoveID,
			UserID:        row.UserID,
			PlanID:        row.PlanID,
			DayPlanID:     row.DayPlanID,
			MoveName:      moveName,
			MoveId:        row.MoveID,
		})
	}

	return ftx.Status(fiber.StatusOK).JSON(map[string]interface{}{"moves": moves})
}

func GetPlanRecords(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(database.DB)

	// User Authorization
	userEmail, err := utils.ExtractEmailFromClaim(ftx)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}
	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	// Extract Day Plan ID
	idString := ftx.Params("id")
	dayPlanId, err := utils.FetchIntOfParamId(idString)
	if err != nil {
		log.Println("GetSinglePlan: FetchIntOfParamId section", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ExtractUrlParam})
	}

	planRecords, err := q.FetchPlanRecords(ctx, sqlc.FetchPlanRecordsParams{
		UserID:    user.ID,
		DayPlanID: int64(dayPlanId),
	})
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to fetch plan records"})
	}

	return ftx.Status(fiber.StatusOK).JSON(map[string]interface{}{"plan_records": planRecords})
}

func PostAddPlan(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(database.DB)

	user, err := utils.InitialNecessaryValidationsPostReqs(ftx, ctx, q)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	var plan models.IncomingPlan
	if err := ftx.BodyParser(&plan); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	addedPlan, err := q.AddPlan(ctx, sqlc.AddPlanParams{
		UserID:   user.ID,
		PlanName: plan.PlanName,
		Days:     plan.Days,
	})

	log.Printf("%#v", addedPlan)
	if err != nil {
		log.Println(err)
		if strings.Contains(err.Error(), "unique_plan_name") {
			return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "This plan name already exists!"})
		}
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to add new plan"})
	}
	return ftx.Status(fiber.StatusOK).JSON(addedPlan)
}

func PostEditPlan(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(database.DB)

	user, err := utils.InitialNecessaryValidationsPostReqs(ftx, ctx, q)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	var incomingEditPlan models.IncomingEditPlan
	if err := ftx.BodyParser(&incomingEditPlan); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	var movesToAdd []sqlc.AddDayPlanMovesParams
	for _, eachMove := range incomingEditPlan.Moves {
		moveSql, err := q.FetchMoveId(ctx, eachMove.Move)
		if err != nil {
			log.Println(err)
			return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to get move id from database"})
		}
		temp := &sqlc.AddDayPlanMovesParams{
			UserID: user.ID,
			PlanID: incomingEditPlan.PlanID,
			MoveID: moveSql.MoveID,
		}
		movesToAdd = append(movesToAdd, *temp)
	}

	q2 := sqlc.NewQWithTx(database.DB)
	dayPlan, err := q2.CreateDayPlanMoves(ctx, sqlc.DayPlanMovesTx{
		AddDayPlanTx: sqlc.AddDayPlanParams{
			UserID: user.ID,
			PlanID: incomingEditPlan.PlanID,
			Day:    incomingEditPlan.Day,
		},
		AddDayPlanMovesTx: movesToAdd,
	})

	if err != nil {
		if strings.Contains(err.Error(), "unique_plan_day") {
			return ftx.Status(fiber.StatusBadRequest).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Plan for this day already exists!"})
		}
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to add the day plan"})
	}

	log.Printf("%#v", dayPlan)
	return ftx.Status(fiber.StatusOK).JSON(dayPlan)
}

func PostAddDayPlanMoves(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(database.DB)

	user, err := utils.InitialNecessaryValidationsPostReqs(ftx, ctx, q)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	idString := ftx.Params("id")
	planId, err := utils.FetchIntOfParamId(idString)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ExtractUrlParam})
	}

	var incomingMoves models.IncomingAddDayPlanMoves
	if err := ftx.BodyParser(&incomingMoves); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	for _, eachMove := range incomingMoves.MoveNames {
		moveSql, err := q.FetchMoveId(ctx, eachMove)
		if err != nil {
			log.Println(err)
			return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ExtractMoveId})
		}

		if err := q.AddDayPlanMoves(ctx, sqlc.AddDayPlanMovesParams{
			UserID:    user.ID,
			PlanID:    int64(planId),
			DayPlanID: incomingMoves.DayPlanId,
			MoveID:    moveSql.MoveID,
		}); err != nil {
			if strings.Contains(err.Error(), cn.UniqueConstraints.DayPlanMove) {
				return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "One of the provided moves already exists!"})
			}
			log.Println(err)
			return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to add to day_plan_moves"})
		}
	}

	return ftx.Status(fiber.StatusOK).JSON(&cn.ApiRes{ResType: cn.ResTypes.Success, Msg: "Moves added!"})
}

func PostAddPlanRecord(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(database.DB)

	user, err := utils.InitialNecessaryValidationsPostReqs(ftx, ctx, q)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	idString := ftx.Params("id")
	dayPlanId, err := utils.FetchIntOfParamId(idString)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ExtractUrlParam})
	}

	var planRecord models.IncomingAddPlanRecord
	if err = ftx.BodyParser(&planRecord); err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	log.Printf("%#v", planRecord)
	log.Println(planRecord.MoveName)

	move, err := q.FetchMoveId(ctx, planRecord.MoveName)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ExtractMoveId})
	}

	for idx, eachRecordReps := range planRecord.Reps {
		err := q.AddPlanRecord(ctx, sqlc.AddPlanRecordParams{
			UserID:        user.ID,
			DayPlanID:     int64(dayPlanId),
			DayPlanMoveID: planRecord.DayPlanMoveID,
			MoveID:        move.MoveID,
			Week:          planRecord.Week,
			SetRecord:     planRecord.SetRecord[idx],
			Reps:          eachRecordReps,
			Weight:        planRecord.Weight[idx],
		})
		if err != nil {
			if strings.Contains(err.Error(), "unique_plan_records") {
				return ftx.Status(fiber.StatusBadRequest).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "You have already added sets for this move"})
			}
			log.Println(err)
			return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to add the record!"})
		}
	}
	return ftx.SendStatus(fiber.StatusOK)
}

// PATCH
func PatchPlanRecord(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(database.DB)

	user, err := utils.InitialNecessaryValidationsPostReqs(ftx, ctx, q)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	var updatedPlanRec models.IncomingUpdatePlanRecord
	if err = ftx.BodyParser(&updatedPlanRec); err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	_, err = q.UpdatePlanRecord(ctx, sqlc.UpdatePlanRecordParams{
		Reps:         updatedPlanRec.Reps,
		Weight:       updatedPlanRec.Weight,
		UserID:       user.ID,
		PlanRecordID: updatedPlanRec.PlanRecordID,
	})
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to update the plan record details"})
	}

	return ftx.Status(fiber.StatusOK).JSON(&cn.ApiRes{ResType: cn.ResTypes.Success, Msg: "Updated Successfully!"})
}

// DELETE
func DeletePlan(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(database.DB)

	user, err := utils.InitialNecessaryValidationsDeleteReqs(ftx, ctx, q)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	idString := ftx.Params("id")
	planId, err := utils.FetchIntOfParamId(idString)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ExtractUrlParam})
	}

	err = q.DeletePlan(ctx, sqlc.DeletePlanParams{
		UserID: user.ID,
		PlanID: int64(planId),
	})
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ExtractUrlParam})
	}

	return ftx.SendStatus(fiber.StatusOK)
}

func DeleteDayPlan(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(database.DB)

	user, err := utils.InitialNecessaryValidationsDeleteReqs(ftx, ctx, q)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	// Extracting Day Plan ID
	idString := ftx.Params("id")
	dayPlanId, err := utils.FetchIntOfParamId(idString)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to fetch the day plan ID"})
	}

	if err = q.DeleteFitnessDayPlan(ctx, sqlc.DeleteFitnessDayPlanParams{
		UserID:    user.ID,
		DayPlanID: int64(dayPlanId),
	}); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to delete the day plan ID"})
	}

	return ftx.SendStatus(fiber.StatusOK)
}

func DeleteDayPlanMove(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(database.DB)
	qwtx := sqlc.NewQWithTx(database.DB)

	user, err := utils.InitialNecessaryValidationsDeleteReqs(ftx, ctx, q)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	// Extracting Day Plan ID
	idString := ftx.Params("id")
	dayPlanMoveId, err := utils.FetchIntOfParamId(idString)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to fetch the day plan Move ID"})
	}

	if err := qwtx.DeleteDayPlanRecord(ctx, user.ID, int64(dayPlanMoveId)); err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to delete the day plan move"})
	}
	return ftx.SendStatus(fiber.StatusOK)
}

func DeleteWeekFromPlanRecords(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(database.DB)

	user, err := utils.InitialNecessaryValidationsPostReqs(ftx, ctx, q)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	incomingBody := map[string]int32{"week": 0}
	if err = ftx.BodyParser(&incomingBody); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	if err := q.DeleteWeekPlanRecords(ctx, sqlc.DeleteWeekPlanRecordsParams{
		UserID: user.ID,
		Week:   incomingBody["week"],
	}); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Could not delete requested week!" + err.Error()})
	}

	return ftx.SendStatus(fiber.StatusNoContent)
}

func DeleteSetFromPlanRecord(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(database.DB)

	user, err := utils.InitialNecessaryValidationsPostReqs(ftx, ctx, q)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	var deletePlanRecord models.IncomingDeletePlanRecord
	if err = ftx.BodyParser(&deletePlanRecord); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	if err := q.DeletePlanRecord(ctx, sqlc.DeletePlanRecordParams{
		UserID:       user.ID,
		PlanRecordID: deletePlanRecord.PlanRecordID,
	}); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to delete the record"})
	}

	return ftx.SendStatus(fiber.StatusNoContent)
}
