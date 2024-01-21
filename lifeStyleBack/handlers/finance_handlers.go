package handlers

import (
	"context"
	"log"
	"strings"
	"sync"

	"github.com/gofiber/fiber/v2"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/models"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/utils"
	"github.com/sashabaranov/go-openai"

	database "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db"
	sqlc "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"
)

func GetAllBudgets(ftx *fiber.Ctx) error {
	q := sqlc.New(database.DB)
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()

	user, err := utils.InitialNecessaryValidationsGetReqs(ftx, ctx, q)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	// Later that I set the pagination in frontend
	// offset := (pageNumber - 1) * pageSize
	budgets, err := q.SelectAllBudgets(ctx, sqlc.SelectAllBudgetsParams{UserID: user.ID, Offset: 0, Limit: 15})
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Could not find the budgets!"})
	}

	log.Println("Budgets were found. Sending to front end...")
	return ftx.Status(fiber.StatusOK).JSON(map[string]interface{}{"budgets": budgets})
}

func GetSingleBudget(ftx *fiber.Ctx) error {
	q := sqlc.New(database.DB)
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()

	user, err := utils.InitialNecessaryValidationsGetReqs(ftx, ctx, q)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	budgetId, err := utils.FetchIntOfParamId(ftx, "id")
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to fetch the budget ID"})
	}

	singleBudget := sqlc.SelectSingleBudgetParams{
		BudgetID: int64(budgetId),
		UserID:   user.ID,
	}
	budget, err := q.SelectSingleBudget(ctx, singleBudget)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to fetch budget from database"})
	}

	return ftx.Status(fiber.StatusOK).JSON(budget)
}

func GetSingleBalance(ftx *fiber.Ctx) error {
	q := sqlc.New(database.DB)
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()

	user, err := utils.InitialNecessaryValidationsGetReqs(ftx, ctx, q)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	budgetId, err := utils.FetchIntOfParamId(ftx, "id")
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to fetch the budget ID"})
	}

	balance, err := q.SelectBalance(ctx, sqlc.SelectBalanceParams{UserID: user.ID, BudgetID: int64(budgetId)})
	if err != nil {
		if err.Error() == cn.SqlErrors.ErrNoRows {
			return ftx.Status(fiber.StatusNoContent).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to fetch the budget ID"})
		}
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to fetch the balance!"})
	}

	log.Printf("Balance Found: %#v", balance)
	return ftx.Status(fiber.StatusOK).JSON(balance)
}

func GetAllExpenses(ftx *fiber.Ctx) error {
	q := sqlc.New(database.DB)
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()

	user, err := utils.InitialNecessaryValidationsGetReqs(ftx, ctx, q)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	budgetId := make(map[string]int64)
	budgetId["budget_id"] = -1
	if err := ftx.BodyParser(&budgetId); err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}
	budgetID, ok := budgetId["budget_id"]
	if !ok || budgetID == -1 {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	limitQry := ftx.Query("limit", "10")
	offsetQry := ftx.Query("offset", "1")
	convertedInts, err := utils.ConvertStringToInt64([]string{limitQry, offsetQry})
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to fetch data"})
	}
	limit, offset := int32(convertedInts[0]), int32(convertedInts[1])

	bugdet, err := q.SelectSingleBudget(ctx, sqlc.SelectSingleBudgetParams{BudgetID: budgetID, UserID: user.ID})
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to fetch expenses"})
	}

	var wg sync.WaitGroup
	wg.Add(6)
	var capitalExpenses []sqlc.CapitalExpense
	var eatoutExpenses []sqlc.EatoutExpense
	var entertainmentExpenses []sqlc.EntertainmentExpense
	var capitalRowsCount, eatoutRowscount, entertRowscount int64 = -1, -1, -1
	var totalCapital, totalEatout, totalEnter string = "NA", "NA", "NA"

	// Fetch the Total amounts for each expense type
	go utils.ConcurrentTotalCapital(&wg, ctx, q, user.ID, budgetID, &totalCapital)
	go utils.ConcurrentTotalEatout(&wg, ctx, q, user.ID, budgetID, &totalEatout)
	go utils.ConcurrentTotalEnter(&wg, ctx, q, user.ID, budgetID, &totalEnter)

	// Fetch all expenses for each expense type
	go utils.ConcurrentCapExpenses(&wg, ctx, q, user.ID, budgetID, limit, offset, &capitalExpenses, &capitalRowsCount)
	go utils.ConcurrentEatExpenses(&wg, ctx, q, user.ID, budgetID, limit, offset, &eatoutExpenses, &eatoutRowscount)
	go utils.ConcurrentEnterExpenses(&wg, ctx, q, user.ID, budgetID, limit, offset, &entertainmentExpenses, &entertRowscount)
	wg.Wait()

	if capitalRowsCount == -1 || eatoutRowscount == -1 || entertRowscount == -1 {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to fetch the expenses"})
	}

	return ftx.Status(fiber.StatusOK).JSON(map[string]interface{}{"allExpenses": &models.AllExpensesRes{
		BudgetName:             bugdet.BudgetName,
		CapitalExpenses:        capitalExpenses,
		EatoutExpenses:         eatoutExpenses,
		EntertainmentExpenses:  entertainmentExpenses,
		CapitalRowsCount:       capitalRowsCount,
		EatoutRowsCount:        eatoutRowscount,
		EntertainmentRowsCount: entertRowscount,
		TotalCapital:           totalCapital,
		TotalEatout:            totalEatout,
		TotalEnter:             totalEnter,
	}})
}

func PostNewBudget(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(database.DB)

	user, err := utils.InitialNecessaryValidationsPostReqs(ftx, ctx, q)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	var newBudget sqlc.CreateBudgetParams
	if err := ftx.BodyParser(&newBudget); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	operationBudget := sqlc.CreateBudgetBalanceTx(newBudget)
	operationBudget.UserID = user.ID
	op := sqlc.NewBudgetBalance(database.DB)
	result, err := op.CreateBudgetBalance(ctx, operationBudget)
	if err != nil {
		log.Println(err)
		if strings.Contains(err.Error(), "unique_combination_constraint") {
			return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Budget NAME already exists. Choose another one please!"})
		}
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to add the budget!"})
	}
	log.Printf("Budget Creation Success: %v", result)
	return ftx.Status(fiber.StatusCreated).JSON(&cn.ApiRes{ResType: cn.ResTypes.Success, Msg: "Budget Created Successfully!"})
}

func PostExpenses(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(database.DB)

	user, err := utils.InitialNecessaryValidationsPostReqs(ftx, ctx, q)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	// JSON Parsing Stage
	var newExpense models.ExpenseReq
	if err := ftx.BodyParser(&newExpense); err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	q2 := sqlc.NewBudgetBalance(database.DB)
	updatedBalance, err := q2.AddExpenseUpdateBalance(ctx, sqlc.AddExpenseUpdateBalanceTx{
		BudgetID:    newExpense.BudgetID,
		UserID:      user.ID,
		Expenses:    newExpense.ExpenseAmount,
		ExpenseType: newExpense.ExpenseType,
		Description: newExpense.ExpenseDesc,
	})

	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to complete the expense adding transaction"})
	}

	log.Println(newExpense.ExpenseType + " expense was added for " + user.Email)
	return ftx.Status(fiber.StatusOK).JSON(updatedBalance)
}

func PostGptApi(ftx *fiber.Ctx) error {
	if err := utils.ValidateContentType(ftx); err != nil {
		return ftx.Status(fiber.StatusBadRequest).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ContentType})
	}
	_, err := utils.ExtractEmailFromClaim(ftx)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	var body map[string]string
	if err := ftx.BodyParser(&body); err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	client := openai.NewClient(cn.EnvVars.GptApiKey)
	response, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT3Dot5Turbo0613,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleUser,
					Content: body["prompt"],
				},
			},
		},
	)
	if err != nil {
		log.Printf("ChatCompletion error: %v\n", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Faild to get response from GPT API"})
	}
	log.Println(response.Choices[0].Message.Content)
	return ftx.Status(fiber.StatusOK).JSON(map[string]string{"GPTResp": response.Choices[0].Message.Content})
}

func DeleteBudget(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(database.DB)

	user, err := utils.InitialNecessaryValidationsPostReqs(ftx, ctx, q)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	// Extract Budget ID
	budgetId, err := utils.FetchIntOfParamId(ftx, "id")
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ExtractUrlParam})
	}

	if err = q.DeleteBudget(ctx, sqlc.DeleteBudgetParams{
		BudgetID: int64(budgetId),
		UserID:   user.ID,
	}); err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to delete the budget!"})
	}

	log.Printf("Budget ID: %v -> Deleted", budgetId)
	return ftx.Status(fiber.StatusAccepted).JSON(&cn.ApiRes{ResType: cn.ResTypes.Success, Msg: "Budget was deleted successfully!"})
}

/*
PATCH Section
*/
func PatchBudget(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(database.DB)

	user, err := utils.InitialNecessaryValidationsPostReqs(ftx, ctx, q)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	// Prepare the input
	var updateBudgetBalance sqlc.UpdateBudgetBalanceTx
	if err := ftx.BodyParser(&updateBudgetBalance); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}
	updateBudgetBalance.UserID = user.ID
	log.Printf("Incoming: %#v", updateBudgetBalance)

	// Do the transaction
	q2 := sqlc.NewBudgetBalance(database.DB)
	updatedBudget, updatedBalance, err := q2.UpdateBudgetBalance(ctx, updateBudgetBalance)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to update the budget"})
	}

	log.Println("Budget and balance updated successfully!")
	return ftx.Status(fiber.StatusOK).JSON(map[string]interface{}{
		"updated_budget":  updatedBudget,
		"updated_balance": updatedBalance,
	})
}
