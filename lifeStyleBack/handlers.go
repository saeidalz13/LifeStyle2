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

func GetHome(ftx *fiber.Ctx) error {
	jwtCookie := ftx.Cookies("jwt")
	log.Println(jwtCookie)
	if jwtCookie == "" {
		return ftx.JSON(&ApiError{Err: "error", Msg: "Not Signed In"})
	}
	return ftx.JSON(&ApiSuccess{Success: "success", Msg: "Valid user"})
}

func GetFinance(ftx *fiber.Ctx) error {
	return ftx.JSON(&ApiSuccess{Success: "success", Msg:"Welcome to finances!"})
}

func PostSignup(ftx *fiber.Ctx) error {
	var newUser User

	if contentType := ftx.Get("Content-Type"); contentType != "application/json" {
		log.Println("Unsupported Content-Type:", contentType)
		return ftx.JSON(&ApiError{Err: "error", Msg: "Incorrect request data (not JSON)"})
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
		if result == false {
			return ftx.JSON(&ApiError{Err: "error", Msg: "Failed to add the user!"})
		}
		log.Println("Received:", result)
		return ftx.JSON(newUser)
	case <-ctx.Done():
		log.Println("Request timed out or cancelled")
		return ftx.JSON(&ApiError{Err: "error", Msg: "Request cancelled or time out!"})
	}
}

func PostLogin(ftx *fiber.Ctx) error {
	var loginUser User
	var availUser User
	var id int
	if contentType := ftx.Get("Content-Type"); contentType != "application/json" {
		log.Println("Unsupported Content-Type:", contentType)
		return ftx.JSON(&ApiError{Err: "error", Msg: "Incorrect request data (not JSON)"})
	}

	if err := ftx.BodyParser(&loginUser); err != nil {
		log.Println("Failed to parse the request body")
		return ftx.JSON(&ApiError{Err: "error", Msg: "Failed to parse the request (bad JSON format)"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	row := DB.QueryRowContext(ctx, "SELECT * FROM users WHERE email = ?;", loginUser.Email)
	if err := row.Scan(&id, &availUser.Email, &availUser.Password); err != nil {
		log.Println("Failed to read the row: ", err)
		return ftx.JSON(&ApiError{Err: "error", Msg: "Wrong Email Address! Try Again Please!"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(availUser.Password), []byte(loginUser.Password)); err != nil {
		log.Println("Failed to match the passwords and find the user: ", err)
		return ftx.JSON(&ApiError{Err: "error", Msg: "Wrong Password! Try Again Please!"})
	}

	// JWT Settings
	expirationTime := time.Now().Add(100 * time.Minute)
	tokenString, err := GenerateToken(expirationTime, availUser.Email)
	if err != nil {
		log.Println("Failed to generate token string:", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiError{Err: "error", Msg: "Failed to log in the user. Please try again later!"})
	}

	ftx.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    tokenString,
		HTTPOnly: true,
		Expires:  expirationTime,
		SameSite: "Strict",
	})

	return ftx.Status(fiber.StatusAccepted).JSON(&ApiSuccess{Success: "success", Msg: "Successfully logged in! Redirecting to home page..."})
}


// Unused

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
