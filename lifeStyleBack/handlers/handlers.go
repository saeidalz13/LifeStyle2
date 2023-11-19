package handlers

import (
	"context"
	"log"
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

func GetAllBudgets(ftx *fiber.Ctx) error {
	q := db.New(database.DB)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}
	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	// Later that I set the pagination in frontend
	// offset := (pageNumber - 1) * pageSize
	budgets, err := q.SelectAllBudgets(ctx, db.SelectAllBudgetsParams{UserID: user.ID, Offset: 0, Limit: 15})
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Could not find the budgets!"})
	}

	log.Printf("%#v", budgets)
	return ftx.Status(fiber.StatusOK).JSON(map[string]interface{}{"budgets": budgets})
}

func GetBudget(ftx *fiber.Ctx) error {
	// User Authentication
	var dbUser models.DbUser
	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := assets.FindUser(ctx, userEmail, &dbUser); err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	budgetId, err := assets.FetchIntOfParamBudgetId(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the budget ID"})
	}

	var eachBudget models.BudgetResp
	if err := assets.FindSingleBudget(ctx, &eachBudget, budgetId, dbUser.Id); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Could not fetch the requested budget ID"})
	}

	return ftx.Status(fiber.StatusAccepted).JSON(eachBudget)
}

func GetSignOut(ftx *fiber.Ctx) error {
	ftx.Cookie(&fiber.Cookie{
		Name:     "paseto",                     // Replace with your cookie name
		Value:    "",                           // Clear the cookie value
		Expires:  time.Now().AddDate(0, 0, -1), // Set expiration to the past
		HTTPOnly: true,                         // Ensure it's set as HttpOnly if needed
		Secure:   cn.EnvVars.DevStage == cn.DevStages.Production,
		SameSite: "None",
	})
	return ftx.SendStatus(fiber.StatusOK)
}

func GetAllExpenses(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// User Authorization
	var dbUser models.DbUser
	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	if err := assets.FindUser(ctx, userEmail, &dbUser); err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	// Extracting Budget ID
	budgetId, err := assets.FetchIntOfParamBudgetId(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the budget ID"})
	}

	done := make(chan bool, 3)
	defer close(done)
	chCap := make(chan []models.CapitalExpensesRes, 1)
	defer close(chCap)
	chEat := make(chan []models.EatoutExpensesRes, 1)
	defer close(chEat)
	chEnter := make(chan []models.EntertainmentExpensesRes, 1)
	defer close(chEnter)

	go assets.FindUserAllCapitalExpenses(ctx, budgetId, dbUser.Id, done, chCap)
	go assets.FindUserAllEatoutExpenses(ctx, budgetId, dbUser.Id, done, chEat)
	go assets.FindUserAllEntertainmentExpenses(ctx, budgetId, dbUser.Id, done, chEnter)

	// Wait for all the processes to complete
	select {
	case <-done:
		capitalExpenses := <-chCap
		eatoutExpenses := <-chEat
		entertainmentExpenses := <-chEnter

		if len(capitalExpenses) == 0 && len(eatoutExpenses) == 0 && len(entertainmentExpenses) == 0 {
			return ftx.SendStatus(fiber.StatusNoContent)
		}

		return ftx.Status(fiber.StatusAccepted).JSON(map[string]interface{}{"allExpenses": &models.AllExpensesRes{
			CapitalExpenses:       capitalExpenses,
			EatoutExpenses:        eatoutExpenses,
			EntertainmentExpenses: entertainmentExpenses,
		}})

	case <-ctx.Done():
		log.Println("Process cancelled or time out!")
		return ftx.Status(fiber.StatusNotImplemented).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Process cancelled or time out!"})
	}
}

func GetSingleBalance(ftx *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// User Authorization
	var dbUser models.DbUser
	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	if err := assets.FindUser(ctx, userEmail, &dbUser); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	// Extracting Budget ID
	budgetId, err := assets.FetchIntOfParamBudgetId(ftx)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the budget ID"})
	}

	// Extracting Balance
	var balanceRes models.DbBalance
	if err := assets.FindSingleBalance(ctx, budgetId, dbUser.Id, &balanceRes); err != nil {
		if err.Error() == SqlErrors.ErrNoRows {
			return ftx.Status(fiber.StatusNoContent).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the budget ID"})
		}
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the balance!"})
	}

	log.Println(balanceRes)
	return ftx.Status(fiber.StatusAccepted).JSON(balanceRes)
}

//////////////////////////

/*
POST Section
*/
func PostSignUp(ftx *fiber.Ctx) error {
	var newUser db.CreateUserParams

	if contentType := ftx.Get("Content-Type"); contentType != "application/json" {
		log.Println("Unsupported Content-Type:", contentType)
		return ftx.Status(fiber.StatusBadRequest).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Incorrect request data (not JSON)"})
	}

	if err := ftx.BodyParser(&newUser); err != nil {
		log.Println("Failed to parse the request body")
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Internal Server Error"})
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newUser.Password), 14)
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Internal Server Error"})
	}
	newUser.Password = string(hashedPassword)

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
		SameSite: fiber.CookieSameSiteNoneMode,
		Secure:   cn.EnvVars.DevStage == cn.DevStages.Production,
	})
	return ftx.Status(fiber.StatusOK).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Successful signing in!"})
}

func PostLogin(ftx *fiber.Ctx) error {
	var userLogin db.CreateUserParams
	if contentType := ftx.Get("Content-Type"); contentType != "application/json" {
		log.Println("Unsupported Content-Type:", contentType)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Incorrect request data (not JSON)"})
	}

	if err := ftx.BodyParser(&userLogin); err != nil {
		log.Println("Failed to parse the request body")
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to parse the request (bad JSON format)"})
	}

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
		SameSite: fiber.CookieSameSiteNoneMode,
		Secure:   cn.EnvVars.DevStage == cn.DevStages.Production,
		Path:     "/",
	})
	return ftx.Status(fiber.StatusOK).JSON(&ApiRes{ResType: ResTypes.Success, Msg: "Successfully logged in! Redirecting to home page..."})
}

func PostNewBudget(ftx *fiber.Ctx) error {
	// User Authentication
	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	q := db.New(database.DB)

	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	var newBudget db.CreateBudgetParams
	if err := ftx.BodyParser(&newBudget); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to parse the requested budget JSON"})
	}

	operationBudget := db.CreateBudgetBalanceTx(newBudget)
	operationBudget.UserID = user.ID
	op := db.NewBudgetBalance(database.DB)
	result, err := op.CreateBudgetBalance(ctx, operationBudget)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to add the budget!"})
	}
	log.Printf("Budget Creation Success: %v", result)
	return ftx.Status(fiber.StatusCreated).JSON(&ApiRes{ResType: ResTypes.Success, Msg: "Budget Created Successfully!"})
}

// TODO: Needs to be fixed! with tx *sql.Tx
func PostExpenses(ftx *fiber.Ctx) error {
	var dbUser models.DbUser
	// Authentication Stage
	// TODO: Needs to be fixed! with tx *sql.Tx
	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}
	// User ID Extraction
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := assets.FindUser(ctx, userEmail, &dbUser); err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	// Extracting Budget ID
	budgetId, err := assets.FetchIntOfParamBudgetId(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the budget ID"})
	}
	var newExpense models.ExpenseReq

	// JSON Parsing Stage
	if err := ftx.BodyParser(&newExpense); err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to parse the JSON request"})
	}

	// Start a transaction
	tx, err := database.DB.Begin()
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to update the budget!"})
	}

	// Insertion To Expenses
	done := make(chan bool, 2)
	defer close(done)

	assets.AddExpenses(ctx, tx, done, budgetId, dbUser.Id, &newExpense)
	assets.UpdateSingleBalanceWithExpense(ctx, tx, done, budgetId, dbUser.Id, &newExpense)

	select {
	case <-done:
		if err := tx.Commit(); err != nil {
			return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to add the new budget!"})
		}

		return ftx.Status(fiber.StatusCreated).JSON(&ApiRes{ResType: ResTypes.Success, Msg: "Expense was added successfully!"})

	case <-ctx.Done():
		log.Println("Request timed out or cancelled")
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Request cancelled or time out!"})
	}
}

////////////////////////

/*
DELETE Section
*/
func DeleteBudget(ftx *fiber.Ctx) error {
	// User Authentication
	var dbUser models.DbUser
	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := assets.FindUser(ctx, userEmail, &dbUser); err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	// Extract Budget ID
	budgetId, err := assets.FetchIntOfParamBudgetId(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the budget ID"})
	}

	ch := make(chan bool, 1)
	ctx2, cancel2 := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel2()

	assets.DeleteRequestedBudget(ctx2, ch, budgetId, dbUser.Id)

	select {
	case result := <-ch:
		if !result {
			return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to delete the budget!"})
		}
		log.Println("Deleted:", result)
		return ftx.Status(fiber.StatusAccepted).JSON(&ApiRes{ResType: ResTypes.Success, Msg: "Budget was deleted successfully!"})

	case <-ctx2.Done():
		log.Println("Request timed out or cancelled")
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Request cancelled or time out!"})
	}
}

func DeleteUser(ftx *fiber.Ctx) error {
	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	q := db.New(database.DB)
	if err := q.DeleteUser(ctx, userEmail); err != nil {
		return ftx.Status(fiber.StatusBadRequest).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "User was NOT deleted!"})
	}

	return ftx.Status(fiber.StatusOK).JSON(&ApiRes{ResType: ResTypes.Success, Msg: "User was deleted successfully!"})
}

///////////////////////

/*
PATCH Section
*/
func PatchBudget(ftx *fiber.Ctx) error {
	var dbUser models.DbUser

	// Authenticate User
	userEmail, err := assets.ExtractEmailFromClaim(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := assets.FindUser(ctx, userEmail, &dbUser); err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	// Extract Request Information
	budgetId, err := assets.FetchIntOfParamBudgetId(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the budget ID"})
	}
	var updateBudgetReq models.UpdateBudgetReq
	if err := ftx.BodyParser(&updateBudgetReq); err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to parse the JSON request"})
	}

	// Start a transaction
	tx, err := database.DB.Begin()
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to update the budget!"})
	}

	// Update Budget
	done := make(chan bool, 2)
	defer close(done)

	if err := assets.UpdateSingleBudget(ctx, done, tx, budgetId, dbUser.Id, &updateBudgetReq); err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to update the budget!"})
	}

	if updateBudgetReq.BudgetType == models.BudgetUpdateOptions.Savings {
		done <- true
	} else {
		assets.UpdateSingleBalanceWithBudget(ctx, tx, done, budgetId, dbUser.Id, &updateBudgetReq)
	}

	select {
	case <-done:
		if err := tx.Commit(); err != nil {
			return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to update the budget!"})
		}
		return ftx.Status(fiber.StatusAccepted).JSON(&ApiRes{ResType: ResTypes.Success, Msg: "Budget was updated successfully!"})

	case <-ctx.Done():
		log.Println("Request timed out or cancelled")
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Request cancelled or time out!"})
	}
}
