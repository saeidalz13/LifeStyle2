package handlers

import (
	"context"
	"log"
	"strings"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/assets"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/database"
	db "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/models"
)

func GetAllBudgets(ftx *fiber.Ctx) error {
	q := db.New(database.DB)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

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

	// Later that I set the pagination in frontend
	// offset := (pageNumber - 1) * pageSize
	budgets, err := q.SelectAllBudgets(ctx, db.SelectAllBudgetsParams{UserID: user.ID, Offset: 0, Limit: 15})
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Could not find the budgets!"})
	}

	log.Println("Budgets were found. Sending to front end...")
	return ftx.Status(fiber.StatusOK).JSON(map[string]interface{}{"budgets": budgets})
}

func GetSingleBudget(ftx *fiber.Ctx) error {
	// User Authentication
	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	q := db.New(database.DB)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	// Extracting Budget ID
	budgetId, err := assets.FetchIntOfParamId(ftx, "id")
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the budget ID"})
	}

	var singleBudget db.SelectSingleBudgetParams
	singleBudget.BudgetID = int64(budgetId)
	singleBudget.UserID = user.ID
	budget, err := q.SelectSingleBudget(ctx, singleBudget)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch budget from database"})
	}

	return ftx.Status(fiber.StatusOK).JSON(budget)
}

func GetSingleBalance(ftx *fiber.Ctx) error {
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
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	// Extracting Budget ID
	budgetId, err := assets.FetchIntOfParamId(ftx, "id")
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the budget ID"})
	}

	balance, err := q.SelectBalance(ctx, db.SelectBalanceParams{UserID: user.ID, BudgetID: int64(budgetId)})
	if err != nil {
		if err.Error() == SqlErrors.ErrNoRows {
			return ftx.Status(fiber.StatusNoContent).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the budget ID"})
		}
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the balance!"})
	}

	log.Printf("Balance Found: %#v", balance)
	return ftx.Status(fiber.StatusOK).JSON(balance)
}

func GetAllExpenses(ftx *fiber.Ctx) error {
	// User Authentication
	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	q := db.New(database.DB)

	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	budgetId := make(map[string]int64)
	budgetId["budget_id"] = -1
	if err := ftx.BodyParser(&budgetId); err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}
	budgetID, ok := budgetId["budget_id"]
	if !ok || budgetID == -1 {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	limitQry := ftx.Query("limit", "10")
	offsetQry := ftx.Query("offset", "1")
	convertedInts, err := assets.ConvertStringToInt64([]string{limitQry, offsetQry})
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch data"})
	}
	limit, offset := int32(convertedInts[0]), int32(convertedInts[1])

	bugdet, err := q.SelectSingleBudget(ctx, db.SelectSingleBudgetParams{BudgetID: budgetID, UserID: user.ID})
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch expenses"})
	}

	var wg sync.WaitGroup
	wg.Add(3)
	var capitalExpenses []db.CapitalExpense
	var eatoutExpenses []db.EatoutExpense
	var entertainmentExpenses []db.EntertainmentExpense
	var capitalRowsCount, eatoutRowscount, entertRowscount int64 = -1, -1, -1

	go assets.ConcurrentCapExpenses(&wg, ctx, q, user, budgetID, limit, offset, &capitalExpenses, &capitalRowsCount)
	go assets.ConcurrentEatExpenses(&wg, ctx, q, user, budgetID, limit, offset, &eatoutExpenses, &eatoutRowscount)
	go assets.ConcurrentEnterExpenses(&wg, ctx, q, user, budgetID, limit, offset, &entertainmentExpenses, &entertRowscount)

	wg.Wait()

	if capitalRowsCount == -1 || eatoutRowscount == -1 || entertRowscount == -1 {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the expenses"})
	}

	return ftx.Status(fiber.StatusOK).JSON(map[string]interface{}{"allExpenses": &models.AllExpensesRes{
		BudgetName:             bugdet.BudgetName,
		CapitalExpenses:        capitalExpenses,
		EatoutExpenses:         eatoutExpenses,
		EntertainmentExpenses:  entertainmentExpenses,
		CapitalRowsCount:       capitalRowsCount,
		EatoutRowsCount:        eatoutRowscount,
		EntertainmentRowsCount: entertRowscount,
	}})
}

func PostNewBudget(ftx *fiber.Ctx) error {
	// User Authentication
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

	var newBudget db.CreateBudgetParams
	if err := ftx.BodyParser(&newBudget); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	operationBudget := db.CreateBudgetBalanceTx(newBudget)
	operationBudget.UserID = user.ID
	op := db.NewBudgetBalance(database.DB)
	result, err := op.CreateBudgetBalance(ctx, operationBudget)
	if err != nil {
		log.Println(err)
		if strings.Contains(err.Error(), "unique_combination_constraint") {
			return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Budget NAME already exists. Choose another one please!"})
		}
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to add the budget!"})
	}
	log.Printf("Budget Creation Success: %v", result)
	return ftx.Status(fiber.StatusCreated).JSON(&ApiRes{ResType: ResTypes.Success, Msg: "Budget Created Successfully!"})
}

func PostExpenses(ftx *fiber.Ctx) error {
	// User Authentication
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

	// JSON Parsing Stage
	var newExpense models.ExpenseReq
	if err := ftx.BodyParser(&newExpense); err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	q2 := db.NewBudgetBalance(database.DB)
	updatedBalance, err := q2.AddExpenseUpdateBalance(ctx, db.AddExpenseUpdateBalanceTx{
		BudgetID:    newExpense.BudgetID,
		UserID:      user.ID,
		Expenses:    newExpense.ExpenseAmount,
		ExpenseType: newExpense.ExpenseType,
		Description: newExpense.ExpenseDesc,
	})

	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to complete the expense adding transaction"})
	}

	log.Println(newExpense.ExpenseType + " expense was added for " + user.Email)
	return ftx.Status(fiber.StatusOK).JSON(updatedBalance)
}


func DeleteBudget(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	// Extract user ID
	q := db.New(database.DB)
	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	// Extract Budget ID
	budgetId, err := assets.FetchIntOfParamId(ftx, "id")
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ExtractUrlParam})
	}

	if err = q.DeleteBudget(ctx, db.DeleteBudgetParams{
		BudgetID: int64(budgetId),
		UserID:   user.ID,
	}); err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to delete the budget!"})
	}

	log.Printf("Budget ID: %v -> Deleted", budgetId)
	return ftx.Status(fiber.StatusAccepted).JSON(&ApiRes{ResType: ResTypes.Success, Msg: "Budget was deleted successfully!"})
}


/*
PATCH Section
*/
func PatchBudget(ftx *fiber.Ctx) error {
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

	// Prepare the input
	var updateBudgetBalance db.UpdateBudgetBalanceTx
	if err := ftx.BodyParser(&updateBudgetBalance); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}
	updateBudgetBalance.UserID = user.ID
	log.Printf("Incoming: %#v", updateBudgetBalance)

	// Do the transaction
	q2 := db.NewBudgetBalance(database.DB)
	updatedBudget, updatedBalance, err := q2.UpdateBudgetBalance(ctx, updateBudgetBalance)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to update the budget"})
	}

	log.Println("Budget and balance updated successfully!")
	return ftx.Status(fiber.StatusOK).JSON(map[string]interface{}{
		"updated_budget":  updatedBudget,
		"updated_balance": updatedBalance,
	})
}