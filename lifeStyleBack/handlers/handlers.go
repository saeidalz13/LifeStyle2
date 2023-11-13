package handlers

import (
	"context"
	"database/sql"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/assets"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/database"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/models"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/token"
	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct {
	DB *sql.DB // Declare DB as a field in the handler struct
}

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

func GetFinance(ftx *fiber.Ctx) error {
	return ftx.JSON(&ApiRes{ResType: ResTypes.Success, Msg: "Valid User!"})
}

func GetAllBudgets(ftx *fiber.Ctx) error {
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

	ctx2, cancel2 := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel2()
	userBudgets, err := assets.FindUserAllBudgets(ctx2, dbUser.Id)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the budgets from database"})
	}

	return ftx.Status(fiber.StatusAccepted).JSON(map[string]interface{}{"budgets": userBudgets})
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
		Name:     "paseto",                        // Replace with your cookie name
		Value:    "",                           // Clear the cookie value
		Expires:  time.Now().AddDate(0, 0, -1), // Set expiration to the past
		HTTPOnly: true,                         // Ensure it's set as HttpOnly if needed
	})
	return ftx.Redirect(cn.URLS.Home)
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
func PostSignup(ftx *fiber.Ctx) error {
	var newUser models.User
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

	done := make(chan bool, 2)
	defer close(done)

	// Add User
	ch := make(chan bool, 1)
	ch2 := make(chan string, 1)
	defer close(ch)
	defer close(ch2)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	go assets.AddUser(newUser, hashedPassword, ctx, ch, done)

	// Paseto Settings
	go func(chan string) {
		tokenString, err := token.PasetoMakerGlobal.CreateToken(newUser.Email, Duration)
		if err != nil {
			log.Println("Failed to generate token string:", err)
			ch2 <- ""
			done <- false
			return
		}
		ch2 <- tokenString
		done <- true
		return
	}(ch2)

	select {
	case <-done:
		resAdd := <-ch
		resPaseto := <-ch2
		if resAdd && resPaseto != "" {
			ftx.Cookie(&fiber.Cookie{
				Name:     "paseto",
				Value:    resPaseto,
				HTTPOnly: true,
				Expires:  ExpirationTime,
				SameSite: "Strict",
			})
			return ftx.Status(fiber.StatusOK).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Successful signing in!"})
		}
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Unexpected error from the server"})

	case <-ctx.Done():
		log.Println("Process cancelled or time out!")
		return ftx.Status(fiber.StatusNotImplemented).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Process cancelled or time out!"})
	}
}

func PostLogin(ftx *fiber.Ctx) error {
	var loginUser models.User
	var availUser models.User
	var id int
	if contentType := ftx.Get("Content-Type"); contentType != "application/json" {
		log.Println("Unsupported Content-Type:", contentType)
		return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Incorrect request data (not JSON)"})
	}

	if err := ftx.BodyParser(&loginUser); err != nil {
		log.Println("Failed to parse the request body")
		return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to parse the request (bad JSON format)"})
	}

	var createdAt []uint8
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	row := database.DB.QueryRowContext(ctx, models.SqlStatements.SelectUser, loginUser.Email)
	if err := row.Scan(&id, &availUser.Email, &availUser.Password, &createdAt); err != nil {
		log.Println("Failed to read the row: ", err)
		return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Wrong Email Address! Try Again Please!"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(availUser.Password), []byte(loginUser.Password)); err != nil {
		log.Println("Failed to match the passwords and find the user: ", err)
		return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Wrong Password! Try Again Please!"})
	}

	// Paseto Settings
	tokenString, err := token.PasetoMakerGlobal.CreateToken(availUser.Email, Duration)
	if err != nil {
		log.Println("Failed to generate token string:", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to log in the user. Please try again later!"})
	}

	ftx.Cookie(&fiber.Cookie{
		Name:     "paseto",
		Value:    tokenString,
		HTTPOnly: true,
		Expires:  ExpirationTime,
		SameSite: "Strict",
	})

	return ftx.Status(fiber.StatusAccepted).JSON(&ApiRes{ResType: ResTypes.Success, Msg: "Successfully logged in! Redirecting to home page..."})
}

func PostNewBudget(ftx *fiber.Ctx) error {
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

	// Budget Data
	var newBudget models.NewBudgetReq
	if err := ftx.BodyParser(&newBudget); err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to parse the requested budget JSON"})
	}

	startDate, endDate, err := assets.ConvertToDate(newBudget.StartDate, newBudget.EndDate)
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	tx, err := database.DB.Begin()
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to update the budget!"})
	}

	done := make(chan bool, 2)
	defer close(done)

	addedBudgetId, err := assets.AddNewBudget(ctx, tx, done, &newBudget, startDate, endDate, dbUser.Id)
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to add the new budget! Try again later"})
	}
	assets.AddNewBalance(ctx, tx, done, int(addedBudgetId), dbUser.Id, &newBudget)

	select {
	case <-done:
		if err := tx.Commit(); err != nil {
			return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to add the new budget! Try again later"})
		}
		return ftx.Status(fiber.StatusAccepted).JSON(&ApiRes{ResType: ResTypes.Success, Msg: "Budget Created Successfully!"})

	case <-ctx.Done():
		log.Println("Request timed out or cancelled")
		return ftx.Status(fiber.StatusNotImplemented).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Request cancelled or time out!"})
	}
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
