package handlers

import (
	"context"
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"

	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/assets"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/database"
	db "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/models"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/token"
)

/*
GET Section
*/
func GetHome(ftx *fiber.Ctx) error {
	// User Authentication
	_, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		return ftx.SendStatus(fiber.StatusUnauthorized)
	}
	return ftx.SendStatus(fiber.StatusOK)
}

func GetProfile(ftx *fiber.Ctx) error {
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
	return ftx.Status(fiber.StatusOK).JSON(user)
}

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

func GetSignOut(ftx *fiber.Ctx) error {
	ftx.Cookie(&fiber.Cookie{
		Name:     "paseto",                     // Replace with your cookie name
		Value:    "",                           // Clear the cookie value
		Expires:  time.Now().AddDate(0, 0, -1), // Set expiration to the past
		HTTPOnly: true,                         // Ensure it's set as HttpOnly if needed
		Secure:   cn.EnvVars.DevStage == cn.DevStages.Production,
		SameSite: fiber.CookieSameSiteLaxMode,
	})
	return ftx.SendStatus(fiber.StatusOK)
}

func GetAllExpenses(ftx *fiber.Ctx) error {
	// User Authentication
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

	budgetId := make(map[string]int64)
	budgetId["budget_id"] = -1
	if err := ftx.BodyParser(&budgetId); err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}
	budgetID, ok := budgetId["budget_id"]
	if !ok || budgetID == -1 {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}
	limit := ftx.Query("limit", "10")
	offset := ftx.Query("offset", "1")

	convertedInts, err := assets.ConvertStringToInt64([]string{limit, offset})
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch data"})
	}

	// done := make(chan bool, 3)
	// defer close(done)
	// chCap := make(chan []models.CapitalExpensesRes, 1)
	// defer close(chCap)
	// chEat := make(chan []models.EatoutExpensesRes, 1)
	// defer close(chEat)
	// chEnter := make(chan []models.EntertainmentExpensesRes, 1)
	// defer close(chEnter)

	// Capital Expenses
	capitalExpenses, err := q.FetchAllCapitalExpenses(ctx, db.FetchAllCapitalExpensesParams{
		UserID:   user.ID,
		BudgetID: budgetID,
		Limit:    int32(convertedInts[0]),
		Offset:   int32(convertedInts[1]),
	})
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch expenses"})
	}
	capitalRowsCount, err := q.CountCapitalRows(ctx, db.CountCapitalRowsParams{
		UserID:   user.ID,
		BudgetID: budgetID,
	})
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch expenses"})
	}

	// Eatout Expenses
	eatoutExpenses, err := q.FetchAllEatoutExpenses(ctx, db.FetchAllEatoutExpensesParams{
		UserID:   user.ID,
		BudgetID: budgetID,
		Limit:    int32(convertedInts[0]),
		Offset:   int32(convertedInts[1]),
	})
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch expenses"})
	}
	eatoutRowscount, err := q.CountEatoutRows(ctx, db.CountEatoutRowsParams{
		UserID:   user.ID,
		BudgetID: budgetID,
	})
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch expenses"})
	}

	// Entertainment Expenses
	entertainmentExpenses, err := q.FetchAllEntertainmentExpenses(ctx, db.FetchAllEntertainmentExpensesParams{
		UserID:   user.ID,
		BudgetID: budgetID,
		Limit:    int32(convertedInts[0]),
		Offset:   int32(convertedInts[1]),
	})
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch expenses"})
	}
	entertRowscount, err := q.CountEntertainmentRows(ctx, db.CountEntertainmentRowsParams{
		UserID:   user.ID,
		BudgetID: budgetID,
	})
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch expenses"})
	}

	// log.Printf("%#v", capitalExpenses)
	// log.Printf("%#v", eatoutExpenses)
	// log.Printf("%#v", entertainmentExpenses)

	return ftx.Status(fiber.StatusOK).JSON(map[string]interface{}{"allExpenses": &models.AllExpensesRes{
		CapitalExpenses:        capitalExpenses,
		EatoutExpenses:         eatoutExpenses,
		EntertainmentExpenses:  entertainmentExpenses,
		CapitalRowsCount:       capitalRowsCount,
		EatoutRowsCount:        eatoutRowscount,
		EntertainmentRowsCount: entertRowscount,
	}})
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

	// // Extracting Balance
	// var balanceRes models.DbBalance
	// if err := assets.FindSingleBalance(ctx, budgetId, dbUser.Id, &balanceRes); err != nil {
	// 	if err.Error() == SqlErrors.ErrNoRows {
	// 		return ftx.Status(fiber.StatusNoContent).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the budget ID"})
	// 	}
	// 	return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the balance!"})
	// }

	// log.Println(balanceRes)
	// return ftx.Status(fiber.StatusAccepted).JSON(balanceRes)
}

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
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	plans, err := q.FetchFitnessPlans(ctx, user.ID)
	if err != nil {
		log.Println(err)
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
	planIDQry := ftx.Query("planID", "0")
	convertedInts, err := assets.ConvertStringToInt64([]string{planIDQry})
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch data"})
	}
	planId := convertedInts[0]

	dayPlans, err := q.FetchFitnessDayPlans(ctx, db.FetchFitnessDayPlansParams{
		UserID: user.ID,
		PlanID: planId,
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
		log.Println(err)
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
			moveObj.MoveName = row.MoveName
			moveObj.Days = row.Days
			moveObj.PlanId = row.PlanID
			moves = append(moves, moveObj)
		}
	}

	log.Printf("%#v", moves)
	return ftx.Status(fiber.StatusOK).JSON(map[string]interface{}{"day_plan_moves": moves})
}

//////////////////////////

/*
POST Section
*/
func PostSignUp(ftx *fiber.Ctx) error {
	var newUser db.CreateUserParams

	if err := assets.ValidateContentType(ftx); err != nil {
		return ftx.Status(fiber.StatusBadRequest).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ContentType})
	}

	if err := ftx.BodyParser(&newUser); err != nil {
		log.Println("Failed to parse the request body")
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	// Hashing the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newUser.Password), 14)
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Internal Server Error"})
	}
	newUser.Password = string(hashedPassword)
	// Normalizing Email
	newUser.Email = strings.ToLower(newUser.Email)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	q := db.New(database.DB)

	createdUser, err := q.CreateUser(ctx, newUser)
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Internal Server Error"})
	}
	log.Printf("%#v", createdUser)

	tokenString, err := token.PasetoMakerGlobal.CreateToken(newUser.Email, Duration)
	if err != nil {
		log.Println("Failed to generate token string:", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Internal Server Error"})
	}

	ftx.Cookie(&fiber.Cookie{
		Name:     "paseto",
		Value:    tokenString,
		HTTPOnly: true,
		Expires:  ExpirationTime,
		SameSite: fiber.CookieSameSiteLaxMode,
		Secure:   cn.EnvVars.DevStage == cn.DevStages.Production,
		Path:     "/",
	})
	return ftx.Status(fiber.StatusOK).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Successful signing in!"})
}

func PostLogin(ftx *fiber.Ctx) error {
	var userLogin db.CreateUserParams
	if err := assets.ValidateContentType(ftx); err != nil {
		return ftx.Status(fiber.StatusBadRequest).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ContentType})
	}

	if err := ftx.BodyParser(&userLogin); err != nil {
		log.Println("Failed to parse the request body")
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	// Normalizing Email
	userLogin.Email = strings.ToLower(userLogin.Email)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	q := db.New(database.DB)
	foundUser, err := q.SelectUser(ctx, userLogin.Email)
	if err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Wrong email address! Please try again!"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(userLogin.Password)); err != nil {
		log.Println("Failed to match the passwords and find the user: ", err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Wrong Password! Try Again Please!"})
	}

	// Paseto Settings
	tokenString, err := token.PasetoMakerGlobal.CreateToken(foundUser.Email, Duration)
	if err != nil {
		log.Println("Failed to generate token string:", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to log in the user. Please try again later!"})
	}

	ftx.Cookie(&fiber.Cookie{
		Name:     "paseto",
		Value:    tokenString,
		HTTPOnly: true,
		Expires:  ExpirationTime,
		SameSite: fiber.CookieSameSiteLaxMode,
		Secure:   cn.EnvVars.DevStage == cn.DevStages.Production,
		Path:     "/",
	})
	return ftx.Status(fiber.StatusOK).JSON(&ApiRes{ResType: ResTypes.Success, Msg: "Successfully logged in! Redirecting to home page..."})
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

// TODO: Needs to be fixed! with tx *sql.Tx
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
			UserID: user.ID,
			PlanID: incomingEditPlan.PlanID,
			MoveID: moveSql.MoveID,
			// DayPlanID: ,
		}
		movesToAdd = append(movesToAdd, *temp)
	}

	q2 := db.NewDayPlanMoves(database.DB)
	dayPlan, err := q2.CreateDayPlanMoves(ctx, db.DayPlanMovesTx{
		AddDayPlanTx: db.AddDayPlanParams{
			UserID: user.ID,
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

////////////////////////

/*
DELETE Section
*/
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
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the budget ID"})
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

func DeleteUser(ftx *fiber.Ctx) error {
	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	q := db.New(database.DB)
	if err := q.DeleteUser(ctx, userEmail); err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "User was NOT deleted!"})
	}

	ftx.Cookie(&fiber.Cookie{
		Name:     "paseto",                     // Replace with your cookie name
		Value:    "",                           // Clear the cookie value
		Expires:  time.Now().AddDate(0, 0, -1), // Set expiration to the past
		HTTPOnly: true,                         // Ensure it's set as HttpOnly if needed
		Secure:   cn.EnvVars.DevStage == cn.DevStages.Production,
		SameSite: fiber.CookieSameSiteLaxMode,
		Path:     "/",
	})

	return ftx.Status(fiber.StatusNoContent).JSON(&ApiRes{ResType: ResTypes.Success, Msg: "User was deleted successfully!"})
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

///////////////////////

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
