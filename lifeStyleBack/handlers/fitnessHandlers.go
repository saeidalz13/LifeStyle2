package handlers

import (
	"context"
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/assets"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/database"
	db "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/models"
)

func GetAllFitnessPlans(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// User Authorization
	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	q := db.New(database.DB)
	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		log.Println("GetAllFitnessPlans: Select User Section", err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	plans, err := q.FetchFitnessPlans(ctx, user.ID)
	if err != nil {
		log.Println("GetAllFitnessPlans: Fetch Fitness Plans section", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch fitness plans"})
	}

	log.Printf("%#v", plans)
	return ftx.Status(fiber.StatusOK).JSON(map[string]interface{}{"plans": plans})
}

func GetAllFitnessDayPlans(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	q := db.New(database.DB)

	// User Authorization
	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}
	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	// Extract Plan ID
	planId, err := assets.FetchIntOfParamId(ftx, "id")
	if err != nil {
		log.Println("GetAllFitnessDayPlans: FetchIntOfParamId section", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ExtractUrlParam})
	}

	dayPlans, err := q.FetchFitnessDayPlans(ctx, db.FetchFitnessDayPlansParams{
		UserID: user.ID,
		PlanID: int64(planId),
	})
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch data"})
	}

	log.Println("Day Plans found; sending to frontend...")
	return ftx.Status(fiber.StatusOK).JSON(map[string]interface{}{"day_plans": dayPlans})
}

func GetAllFitnessDayPlanMoves(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	q := db.New(database.DB)

	// User Authorization
	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}
	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	// Extract Plan ID
	planId, err := assets.FetchIntOfParamId(ftx, "id")
	if err != nil {
		log.Println("GetAllFitnessDayPlanMoves: FetchIntOfParamId section", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ExtractUrlParam})
	}

	joinedData, err := q.JoinDayPlanAndDayPlanMovesAndMoves(ctx)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to join day_plans and day_plan_moves"})
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
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	q := db.New(database.DB)

	// User Authorization
	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}
	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}
	// Extract Plan ID
	planId, err := assets.FetchIntOfParamId(ftx, "id")
	if err != nil {
		log.Println("GetSinglePlan: FetchIntOfParamId section", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ExtractUrlParam})
	}

	plan, err := q.FetchSingleFitnessPlan(ctx, db.FetchSingleFitnessPlanParams{
		UserID: user.ID,
		PlanID: int64(planId),
	})
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch single plan"})
	}
	return ftx.Status(fiber.StatusOK).JSON(plan)
}

func GetAllFitnessDayPlanMovesWorkout(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	q := db.New(database.DB)

	// User Authorization
	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}
	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	// Extract Day Plan ID
	dayPlanId, err := assets.FetchIntOfParamId(ftx, "id")
	if err != nil {
		log.Println("GetSinglePlan: FetchIntOfParamId section", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ExtractUrlParam})
	}

	dayPlanMoves, err := q.FetchFitnessDayPlanMoves(ctx, db.FetchFitnessDayPlanMovesParams{
		UserID:    user.ID,
		DayPlanID: int64(dayPlanId),
	})
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch all day plan moves"})
	}

	var moves []models.RespStartWorkoutDayPlanMoves
	for _, row := range dayPlanMoves {
		moveName, err := q.FetchMoveName(ctx, row.MoveID)
		if err != nil {
			return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ExtractMoveName})
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
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	q := db.New(database.DB)

	// User Authorization
	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}
	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	// Extract Day Plan ID
	dayPlanId, err := assets.FetchIntOfParamId(ftx, "id")
	if err != nil {
		log.Println("GetSinglePlan: FetchIntOfParamId section", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ExtractUrlParam})
	}

	planRecords, err := q.FetchPlanRecords(ctx, db.FetchPlanRecordsParams{
		UserID:    user.ID,
		DayPlanID: int64(dayPlanId),
	})
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch plan records"})
	}

	return ftx.Status(fiber.StatusOK).JSON(map[string]interface{}{"plan_records": planRecords})
}

func PostAddPlan(ftx *fiber.Ctx) error {
	if err := assets.ValidateContentType(ftx); err != nil {
		return ftx.Status(fiber.StatusBadRequest).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ContentType})
	}

	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	q := db.New(database.DB)

	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	var plan models.IncomingPlan
	if err := ftx.BodyParser(&plan); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	addedPlan, err := q.AddPlan(ctx, db.AddPlanParams{
		UserID:   user.ID,
		PlanName: plan.PlanName,
		Days:     plan.Days,
	})

	log.Printf("%#v", addedPlan)
	if err != nil {
		log.Println(err)
		if strings.Contains(err.Error(), "unique_plan_name") {
			return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "This plan name already exists!"})
		}
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to add new plan"})
	}
	return ftx.Status(fiber.StatusOK).JSON(addedPlan)
}

func PostEditPlan(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	q := db.New(database.DB)

	userId, err := assets.InitialNecessaryValidationsPostReqs(ftx, ctx, q)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	var incomingEditPlan models.IncomingEditPlan
	if err := ftx.BodyParser(&incomingEditPlan); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	var movesToAdd []db.AddDayPlanMovesParams
	for _, eachMove := range incomingEditPlan.Moves {
		moveSql, err := q.FetchMoveId(ctx, eachMove.Move)
		if err != nil {
			log.Println(err)
			return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to get move id from database"})
		}
		temp := &db.AddDayPlanMovesParams{
			UserID: userId,
			PlanID: incomingEditPlan.PlanID,
			MoveID: moveSql.MoveID,
		}
		movesToAdd = append(movesToAdd, *temp)
	}

	q2 := db.NewDayPlanMoves(database.DB)
	dayPlan, err := q2.CreateDayPlanMoves(ctx, db.DayPlanMovesTx{
		AddDayPlanTx: db.AddDayPlanParams{
			UserID: userId,
			PlanID: incomingEditPlan.PlanID,
			Day:    incomingEditPlan.Day,
		},
		AddDayPlanMovesTx: movesToAdd,
	})

	if err != nil {
		if strings.Contains(err.Error(), "unique_plan_day") {
			return ftx.Status(fiber.StatusBadRequest).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Plan for this day already exists!"})
		}
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to add the day plan"})
	}

	log.Printf("%#v", dayPlan)
	return ftx.Status(fiber.StatusOK).JSON(dayPlan)
}

func PostAddDayPlanMoves(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	q := db.New(database.DB)

	userId, err := assets.InitialNecessaryValidationsPostReqs(ftx, ctx, q)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	planId, err := assets.FetchIntOfParamId(ftx, "id")
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ExtractUrlParam})
	}

	var incomingMoves models.IncomingAddDayPlanMoves
	if err := ftx.BodyParser(&incomingMoves); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	for _, eachMove := range incomingMoves.MoveNames {
		moveSql, err := q.FetchMoveId(ctx, eachMove)
		if err != nil {
			log.Println(err)
			return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ExtractMoveId})
		}

		if err := q.AddDayPlanMoves(ctx, db.AddDayPlanMovesParams{
			UserID:    userId,
			PlanID:    int64(planId),
			DayPlanID: incomingMoves.DayPlanId,
			MoveID:    moveSql.MoveID,
		}); err != nil {
			if strings.Contains(err.Error(), cn.UniqueConstraints.DayPlanMove) {
				return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "One of the provided moves already exists!"})
			}
			log.Println(err)
			return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to add to day_plan_moves"})
		}
	}

	return ftx.Status(fiber.StatusOK).JSON(&ApiRes{ResType: ResTypes.Success, Msg: "Moves added!"})
}

func PostAddPlanRecord(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	q := db.New(database.DB)

	userId, err := assets.InitialNecessaryValidationsPostReqs(ftx, ctx, q)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	dayPlanId, err := assets.FetchIntOfParamId(ftx, "id")
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ExtractUrlParam})
	}

	var planRecord models.IncomingAddPlanRecord
	if err = ftx.BodyParser(&planRecord); err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	log.Printf("%#v", planRecord)
	log.Println(planRecord.MoveName)

	move, err := q.FetchMoveId(ctx, planRecord.MoveName)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ExtractMoveId})
	}

	for idx, eachRecordReps := range planRecord.Reps {
		err := q.AddPlanRecord(ctx, db.AddPlanRecordParams{
			UserID:        userId,
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
				return ftx.Status(fiber.StatusBadRequest).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "You have already added sets for this move"})
			}
			log.Println(err)
			return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to add the record!"})
		}
	}
	return ftx.SendStatus(fiber.StatusOK)
}

func DeletePlan(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	// Extract user ID
	q := db.New(database.DB)
	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	planId, err := assets.FetchIntOfParamId(ftx, "id")
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ExtractUrlParam})
	}

	deletedPlan, err := q.DeletePlan(ctx, db.DeletePlanParams{
		UserID: user.ID,
		PlanID: int64(planId),
	})
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ExtractUrlParam})
	}

	return ftx.Status(fiber.StatusOK).JSON(deletedPlan)
}

func DeleteDayPlan(ftx *fiber.Ctx) error {
	// Authenticate User
	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Extract user ID
	q := db.New(database.DB)
	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	// Extracting Day Plan ID
	dayPlanId, err := assets.FetchIntOfParamId(ftx, "id")
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the day plan ID"})
	}

	if err = q.DeleteFitnessDayPlan(ctx, db.DeleteFitnessDayPlanParams{
		UserID:    user.ID,
		DayPlanID: int64(dayPlanId),
	}); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to delete the day plan ID"})
	}

	return ftx.SendStatus(fiber.StatusOK)
}

func DeleteDayPlanMove(ftx *fiber.Ctx) error {
	// Authenticate User
	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Extract user ID
	q := db.New(database.DB)
	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	// Extracting Day Plan ID
	dayPlanMoveId, err := assets.FetchIntOfParamId(ftx, "id")
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the day plan Move ID"})
	}

	deletedDayPlanMove, err := q.DeleteFitnessDayPlanMove(ctx, db.DeleteFitnessDayPlanMoveParams{
		UserID:        user.ID,
		DayPlanMoveID: int64(dayPlanMoveId),
	})
	if err != nil {
		log.Println("FetchFitnessDayPlanMoves failure:", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to delete the day plan move"})
	}

	dayPlanMoves, err := q.FetchFitnessDayPlanMoves(ctx, db.FetchFitnessDayPlanMovesParams{
		UserID:    user.ID,
		DayPlanID: deletedDayPlanMove.DayPlanID,
	})
	if err != nil {
		log.Println("FetchFitnessDayPlanMoves failure:", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to check database if day plan has any day plan moves"})
	}

	log.Printf("%#v", dayPlanMoves)
	if len(dayPlanMoves) == 0 {
		if err := q.DeleteFitnessDayPlan(ctx, db.DeleteFitnessDayPlanParams{
			UserID:    user.ID,
			DayPlanID: deletedDayPlanMove.DayPlanID,
		}); err != nil {
			log.Println(err)
			return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to delete day plan because of no more day plan moves"})
		}
	}
	return ftx.SendStatus(fiber.StatusOK)
}
