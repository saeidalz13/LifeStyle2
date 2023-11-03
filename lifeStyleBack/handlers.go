package main

import (
	"context"
	"database/sql"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct {
	DB *sql.DB // Declare DB as a field in the handler struct
}

type Claims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}

/*
GET Section
*/
func GetHome(ftx *fiber.Ctx) error {
	jwtCookie := ftx.Cookies("jwt")
	if jwtCookie == "" {
		return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Not Signed In"})
	}

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(jwtCookie, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(ENVCONSTS.JwtToken), nil
	})
	if err != nil {
		return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Not Signed In"})
	}

	if !token.Valid {
		return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Invalid Token! Not Signed In"})
	}

	return ftx.JSON(&ApiRes{ResType: ResTypes.Success, Msg: "Valid user"})
}

func GetAllBudgets(ftx *fiber.Ctx) error {
	var dbUser DbUser

	userEmail, err := ExtractEmailFromClaim(ftx)
	if err != nil {
		return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := FindUser(ctx, userEmail, &dbUser); err != nil {
		return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	ctx2, cancel2 := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel2()
	userBudgets, err := FindUserBudgets(ctx2, dbUser.Id)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the budgets from database"})
	}

	return ftx.Status(fiber.StatusAccepted).JSON(map[string]interface{}{"budgets": userBudgets})
}

func GetBudget(ftx *fiber.Ctx) error {
	var eachBudget BudgetResp
	budgetId, err := FetchIntOfParamBudgetId(ftx)
	var dbUser DbUser
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the budget ID"})
	}
	userEmail, err := ExtractEmailFromClaim(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := FindUser(ctx, userEmail, &dbUser); err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	ctx2, cancel2 := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel2()
	if err := FindSingleBudget(ctx2, &eachBudget, budgetId, dbUser.Id); err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Could not fetch the requested budget ID"})
	}

	return ftx.Status(fiber.StatusAccepted).JSON(eachBudget)

}

func GetSignOut(ftx *fiber.Ctx) error {
	ftx.Cookie(&fiber.Cookie{
		Name:     "jwt",                        // Replace with your cookie name
		Value:    "",                           // Clear the cookie value
		Expires:  time.Now().AddDate(0, 0, -1), // Set expiration to the past
		HTTPOnly: true,                         // Ensure it's set as HttpOnly if needed
	})

	// Redirect to the home page or any other desired location
	return ftx.Redirect(URLS.Home)
}

//////////////////////////

/*
POST Section
*/
func PostSignup(ftx *fiber.Ctx) error {
	var newUser User

	if contentType := ftx.Get("Content-Type"); contentType != "application/json" {
		log.Println("Unsupported Content-Type:", contentType)
		return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Incorrect request data (not JSON)"})
	}

	if err := ftx.BodyParser(&newUser); err != nil {
		log.Println("Failed to parse the request body")
		return err
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newUser.Password), 14)
	if err != nil {
		return err
	}

	ch := make(chan bool, 1)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	go AddUser(newUser, hashedPassword, ctx, ch)
	log.Println("Process in request...")

	select {
	case result := <-ch:
		if !result {
			return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to add the user!"})
		}
		log.Println("Received:", result)
		return ftx.JSON(newUser)
	case <-ctx.Done():
		log.Println("Request timed out or cancelled")
		return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Request cancelled or time out!"})
	}
}

func PostLogin(ftx *fiber.Ctx) error {
	var loginUser User
	var availUser User
	var id int
	if contentType := ftx.Get("Content-Type"); contentType != "application/json" {
		log.Println("Unsupported Content-Type:", contentType)
		return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Incorrect request data (not JSON)"})
	}

	if err := ftx.BodyParser(&loginUser); err != nil {
		log.Println("Failed to parse the request body")
		return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to parse the request (bad JSON format)"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	row := DB.QueryRowContext(ctx, SqlStatements.SelectUser, loginUser.Email)
	if err := row.Scan(&id, &availUser.Email, &availUser.Password); err != nil {
		log.Println("Failed to read the row: ", err)
		return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Wrong Email Address! Try Again Please!"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(availUser.Password), []byte(loginUser.Password)); err != nil {
		log.Println("Failed to match the passwords and find the user: ", err)
		return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Wrong Password! Try Again Please!"})
	}

	// JWT Settings
	expirationTime := time.Now().Add(100 * time.Minute)
	tokenString, err := GenerateToken(expirationTime, availUser.Email)
	if err != nil {
		log.Println("Failed to generate token string:", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to log in the user. Please try again later!"})
	}

	ftx.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    tokenString,
		HTTPOnly: true,
		Expires:  expirationTime,
		SameSite: "Strict",
	})

	return ftx.Status(fiber.StatusAccepted).JSON(&ApiRes{ResType: ResTypes.Success, Msg: "Successfully logged in! Redirecting to home page..."})
}

func PostNewBudget(ftx *fiber.Ctx) error {
	var newBudget NewBudgetReq
	var dbUser DbUser

	userEmail, err := ExtractEmailFromClaim(ftx)
	if err != nil {
		return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	if err := ftx.BodyParser(&newBudget); err != nil {
		return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to parse the requested budget JSON"})
	}
	log.Println(newBudget)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := FindUser(ctx, userEmail, &dbUser); err != nil {
		return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}
	log.Println(dbUser)

	startDate, endDate, err := ConvertToDate(newBudget.StartDate, newBudget.EndDate)
	if err != nil {
		return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}
	log.Println(startDate, endDate)

	ch := make(chan bool, 1)
	ctx2, cancel2 := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel2()
	AddNewBudget(ctx2, ch, &newBudget, startDate, endDate, dbUser.Id)

	select {
	case result := <-ch:
		if !result {
			return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to add the new budget!"})
		}
		log.Println("Received:", result)
		return ftx.JSON(newBudget)

	case <-ctx2.Done():
		log.Println("Request timed out or cancelled")
		return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Request cancelled or time out!"})
	}
}

func PostExpenses(ftx *fiber.Ctx) error {
	var dbUser DbUser
	// Authentication Stage
	userEmail, err := ExtractEmailFromClaim(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}
	// User ID Extraction
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := FindUser(ctx, userEmail, &dbUser); err != nil {
		return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	// Extracting Budget ID
	budgetId, err := FetchIntOfParamBudgetId(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the budget ID"})
	}
	var newExpense ExpenseReq

	// JSON Parsing Stage
	if err := ftx.BodyParser(&newExpense); err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to parse the JSON request"})
	}

	log.Println(newExpense, budgetId)

	// Insertion To Expenses
	ch := make(chan bool, 1)
	ctx2, cancel2 := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel2()
	AddExpenses(ctx2, ch, budgetId, dbUser.Id, &newExpense)

	select {
	case result := <-ch:
		if !result {
			return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to add the new budget!"})
		}
		log.Println("Received:", result)
		return ftx.JSON(&ApiRes{ResType: ResTypes.Success, Msg: "Expense was added successfully!"})

	case <-ctx2.Done():
		log.Println("Request timed out or cancelled")
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Request cancelled or time out!"})
	}
}

//////////////////////////

/*
DELETE Section
*/
func DeleteBudget(ftx *fiber.Ctx) error {
	budgetId, err := FetchIntOfParamBudgetId(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the budget ID"})
	}

	var dbUser DbUser
	userEmail, err := ExtractEmailFromClaim(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := FindUser(ctx, userEmail, &dbUser); err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	ch := make(chan bool, 1)
	ctx2, cancel2 := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel2()
	DeleteRequestedBudget(ctx2, ch, budgetId, dbUser.Id)

	select {
	case result := <-ch:
		if !result {
			return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to delete the budget!"})
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
	var dbUser DbUser

	// Authenticate User
	userEmail, err := ExtractEmailFromClaim(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := FindUser(ctx, userEmail, &dbUser); err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to validate the user"})
	}

	// Extract Request Information
	budgetId, err := FetchIntOfParamBudgetId(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to fetch the budget ID"})
	}
	var updateBudgetReq UpdateBudgetReq
	if err := ftx.BodyParser(&updateBudgetReq); err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to parse the JSON request"})
	}

	// Update Budget
	ch := make(chan bool, 1)
	ctx2, cancel2 := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel2()
	UpdateSingleBudget(ctx2, ch, budgetId, dbUser.Id, &updateBudgetReq)

	select {
	case result := <-ch:
		if !result {
			return ftx.JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Failed to update the budget!"})
		}
		log.Println("Deleted:", result)
		return ftx.Status(fiber.StatusAccepted).JSON(&ApiRes{ResType: ResTypes.Success, Msg: "Budget was updated successfully!"})

	case <-ctx2.Done():
		log.Println("Request timed out or cancelled")
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Request cancelled or time out!"})
	}
}

/*
Unused
*/
// func HandlerGetHome(w http.ResponseWriter, r *http.Request) {
// 	res := map[string]interface{}{
// 		"message": "Your Data Was Received!",
// 	}
// 	jsonRes, err := json.Marshal(res)
// 	if err != nil {
// 		http.Error(w, err.Error(), http.StatusInternalServerError)
// 		return
// 	}
// 	w.Header().Set("Content-Type", "application/json")
// 	w.Write(jsonRes)
// }

// func HandlerPostNewBudget(w http.ResponseWriter, r *http.Request) {
// 	var newBudget NewBudget
// 	if err := json.NewDecoder(r.Body).Decode(&newBudget); err != nil {
// 		log.Println("Error decoding JSON:", err)
// 		http.Error(w, "Failed to decode JSON", http.StatusBadRequest)
// 		return
// 	}
// 	fmt.Println(newBudget)

// 	// Send back a JSON response
// 	res := &JsonRes{
// 		Message: "New Budget Created Successfully!",
// 	}
// 	jsonRes, err := json.Marshal(res)
// 	if err != nil {
// 		http.Error(w, err.Error(), http.StatusInternalServerError)
// 		return
// 	}
// 	w.Header().Set("Content-Type", "application/json")
// 	w.Write(jsonRes)
// }

/*
// Signup
func (uh *UserHandler) HandlerPostUserSignup(w http.ResponseWriter, r *http.Request) {
	var newUser User
	if err := json.NewDecoder(r.Body).Decode(&newUser); err != nil {
		log.Println("Failed to decode JSON: ", err)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newUser.Password), 14)
	if err != nil {
		log.Println("Failed to hash the password:", err)
		return
	}

	var ins *sql.Stmt
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	ins, err = uh.DB.PrepareContext(ctx, "INSERT INTO `users` (`email`, `password`) VALUES (?, ?);")
	if err != nil {
		panic(err.Error())
	}
	defer ins.Close()
	res, err := ins.Exec(newUser.Email, hashedPassword)
	if err != nil {
		panic(err.Error())
	}
	log.Println(res.RowsAffected())

	resp := map[string]string{
		"message": "User was added",
	}
	jsonResp, err := json.Marshal(resp)
	if err != nil {
		panic(err)
	}
	w.Write(jsonResp)
}


// Login
func (uh *UserHandler) HandlerPostUserLogin(w http.ResponseWriter, r *http.Request) {
	var loginUser User
	var availUser User
	var id int32

	if err := json.NewDecoder(r.Body).Decode(&loginUser); err != nil {
		http.Error(w, "Failed to decode JSON", http.StatusBadRequest)
		log.Println("Failed to decode JSON: ", err)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	row := uh.DB.QueryRowContext(ctx, "SELECT * FROM users WHERE email = ?;", loginUser.Email)
	if err := row.Scan(&id, &availUser.Email, &availUser.Password); err != nil {
		http.Error(w, "Failed to find the user", http.StatusBadRequest)
		log.Println("Failed to read the row: ", err)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(availUser.Password), []byte(loginUser.Password)); err != nil {
		log.Println("Failed to match the passwords and find the user: ", err)
		http.Error(w, "Failed to find the user", http.StatusBadRequest)
		return
	}

	// JWT Settings
	expirationTime := time.Now().Add(100 * time.Minute)
	tokenString, err := GenerateToken(expirationTime, availUser.Email)
	if err != nil {
		log.Println("Failed to generate token string:", err)
		http.Error(w, "Something went wrong!", http.StatusBadRequest)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "jwt",
		Value:    tokenString,
		Expires:  expirationTime,
		HttpOnly: false,
		Path:     "/",
	})

	res := map[string]string{
		"message": "Logged In Successfully!",
	}
	jsonRes, err := json.Marshal(res)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonRes)
}
*/
