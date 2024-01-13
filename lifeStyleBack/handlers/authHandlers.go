package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/utils"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	sqlc "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"
	database "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/token"
	"golang.org/x/crypto/bcrypt"
)

func GetHome(ftx *fiber.Ctx) error {
	// User Authentication
	_, err := utils.ExtractEmailFromClaim(ftx)
	if err != nil {
		return ftx.SendStatus(fiber.StatusUnauthorized)
	}
	return ftx.SendStatus(fiber.StatusOK)
}

func GetProfile(ftx *fiber.Ctx) error {
	q := sqlc.New(database.DB)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	userEmail, err := utils.ExtractEmailFromClaim(ftx)
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

func PostSignUp(ftx *fiber.Ctx) error {
	var newUser sqlc.CreateUserParams

	if err := utils.ValidateContentType(ftx); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusBadRequest).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ContentType})
	}

	if err := ftx.BodyParser(&newUser); err != nil {
		log.Println("Failed to parse the request body", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	// Hashing the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newUser.Password), 14)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "Internal Server Error"})
	}
	newUser.Password = string(hashedPassword)
	// Normalizing Email
	newUser.Email = strings.ToLower(newUser.Email)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	q := sqlc.New(database.DB)

	createdUser, err := q.CreateUser(ctx, newUser)
	if err != nil {
		if strings.Contains(err.Error(), "users_email_key") {
			return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: "User with this email already exists!"})
		}
		log.Println(err)
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
	var userLogin sqlc.CreateUserParams
	if err := utils.ValidateContentType(ftx); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusBadRequest).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ContentType})
	}

	if err := ftx.BodyParser(&userLogin); err != nil {
		log.Println("Failed to parse the request body")
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	// Normalizing Email
	userLogin.Email = strings.ToLower(userLogin.Email)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	q := sqlc.New(database.DB)
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

func DeleteUser(ftx *fiber.Ctx) error {
	userEmail, err := utils.ExtractEmailFromClaim(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&ApiRes{ResType: ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	q := sqlc.New(database.DB)
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

func GetGoogleSignIn(ftx *fiber.Ctx) error {
	randString := GenerateRandomString(20)
	url := GoogleOAuthConfig.AuthCodeURL(randString)
	return ftx.Status(fiber.StatusOK).JSON(map[string]interface{}{"googleUrl": url})
}

func GetGoogleCallback(ftx *fiber.Ctx) error {
	state := ftx.Query("state")
	if state != GoogleState {
		return ftx.Redirect(cn.EnvVars.FrontEndUrl)
	}
	code := ftx.Query("code")
	gToken, err := GoogleOAuthConfig.Exchange(context.Background(), code)
	if err != nil {
		ftx.Redirect(cn.EnvVars.FrontEndUrl)
	}

	resp, err := http.Get(ACCESS_USER_URL + gToken.AccessToken)
	if err != nil {
		return ftx.Redirect(cn.EnvVars.FrontEndUrl)
	}
	defer resp.Body.Close()
	userDataByte, err := io.ReadAll(resp.Body)
	if err != nil {
		return ftx.Redirect(cn.EnvVars.FrontEndUrl)
	}
	var userData OAuthResp
	if err := json.Unmarshal(userDataByte, &userData); err != nil {
		return ftx.Redirect(cn.EnvVars.FrontEndUrl)
	}

	q := sqlc.New(database.DB)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	user, err := q.SelectUser(ctx, userData.Email)
	log.Println(user)
	if err != nil {
		if err == sql.ErrNoRows {
			randString := GenerateRandomString(20)
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(randString), 14)
			if err != nil {
				log.Println(err)
				return ftx.Redirect(cn.EnvVars.FrontEndUrl)
			}
			createdUser, err := q.CreateUser(ctx, sqlc.CreateUserParams{Email: userData.Email, Password: string(hashedPassword)})
			log.Println(createdUser)
			if err != nil {
				return ftx.Redirect(cn.EnvVars.FrontEndUrl)
			}
		} else {
			return ftx.Redirect(cn.EnvVars.FrontEndUrl)
		}
	}

	// Paseto Settings
	tokenString, err := token.PasetoMakerGlobal.CreateToken(userData.Email, Duration)
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

	return ftx.Redirect(cn.EnvVars.FrontEndUrl)
}
