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
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	sqlc "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/token"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/utils"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandlersConfig struct {
	Db  *sql.DB
}

func (a *AuthHandlersConfig) HandleGetHome(ftx *fiber.Ctx) error {
	validEmail, err := utils.ExtractEmailFromClaim(ftx)
	if err != nil {
		log.Println(err)
		return ftx.SendStatus(fiber.StatusUnauthorized)
	}

	q := sqlc.New(a.Db)
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	_, err = q.SelectUser(ctx, validEmail)
	if err != nil {
		log.Println(err)
		return ftx.SendStatus(fiber.StatusUnauthorized)
	}

	return ftx.SendStatus(fiber.StatusOK)
}

func (a *AuthHandlersConfig) HandleGetProfile(ftx *fiber.Ctx) error {
	q := sqlc.New(a.Db)
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()

	user, err := utils.InitialNecessaryValidationsGetReqs(ftx, ctx, q)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}
	return ftx.Status(fiber.StatusOK).JSON(user)
}

func HandleGetSignOut(ftx *fiber.Ctx) error {
	ftx.Cookie(&fiber.Cookie{
		Name:     cn.PASETO_COOKIE_NAME,
		Value:    "",                           // Clear the cookie value
		Expires:  time.Now().AddDate(0, 0, -1), // Set expiration to the past
		HTTPOnly: true,
		Secure:   cn.EnvVars.DevStage == cn.DefaultDevStages.Production,
		SameSite: fiber.CookieSameSiteLaxMode,
	})
	return ftx.SendStatus(fiber.StatusOK)
}

func (a *AuthHandlersConfig) HandlePostSignUp(ftx *fiber.Ctx) error {
	if err := utils.ValidateContentType(ftx); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusBadRequest).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ContentType})
	}

	var newUser sqlc.CreateUserParams
	if err := ftx.BodyParser(&newUser); err != nil {
		log.Println("Failed to parse the request body", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	if err := utils.ValidatePassword(newUser.Password); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusConflict).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: err.Error()})
	}

	// Hashing the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newUser.Password), 14)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Internal Server Error"})
	}
	newUser.Password = string(hashedPassword)
	newUser.Email = strings.ToLower(newUser.Email)

	if err = utils.ValidateEmail(newUser.Email); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusConflict).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: err.Error()})
	}

	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(a.Db)
	_, err = q.CreateUser(ctx, newUser)
	if err != nil {
		if strings.Contains(err.Error(), "users_email_key") {
			return ftx.Status(fiber.StatusConflict).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "User with this email already exists!"})
		}
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Internal Server Error"})
	}
	tokenString, err := token.PasetoMakerGlobal.CreateToken(newUser.Email, cn.PASETO_ACCESS_TOKEN_DURATION)
	if err != nil {
		log.Println("Failed to generate token string:", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Internal Server Error"})
	}

	ftx.Cookie(&fiber.Cookie{
		Name:     "paseto",
		Value:    tokenString,
		HTTPOnly: true,
		Expires:  cn.COOKIE_EXPIRATION_TIME,
		SameSite: fiber.CookieSameSiteLaxMode,
		Secure:   cn.EnvVars.DevStage == cn.DefaultDevStages.Production,
		Path:     "/",
	})
	return ftx.Status(fiber.StatusOK).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Successful signing in!"})
}

func (a *AuthHandlersConfig) HandlePostLogin(ftx *fiber.Ctx) error {
	var userLogin sqlc.CreateUserParams
	if err := utils.ValidateContentType(ftx); err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusBadRequest).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ContentType})
	}

	if err := ftx.BodyParser(&userLogin); err != nil {
		log.Println("Failed to parse the request body")
		log.Println(err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.ParseJSON})
	}

	// Normalizing Email
	userLogin.Email = strings.ToLower(userLogin.Email)

	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(a.Db)
	foundUser, err := q.SelectUser(ctx, userLogin.Email)
	if err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Wrong email address! Please try again!"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(userLogin.Password)); err != nil {
		log.Println("Failed to match the passwords and find the user: ", err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Wrong Password! Try Again Please!"})
	}

	// Paseto Settings
	tokenString, err := token.PasetoMakerGlobal.CreateToken(foundUser.Email, cn.PASETO_ACCESS_TOKEN_DURATION)
	if err != nil {
		log.Println("Failed to generate token string:", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to log in the user. Please try again later!"})
	}

	ftx.Cookie(&fiber.Cookie{
		Name:     cn.PASETO_COOKIE_NAME,
		Value:    tokenString,
		HTTPOnly: true,
		Expires:  cn.COOKIE_EXPIRATION_TIME,
		SameSite: fiber.CookieSameSiteLaxMode,
		Secure:   cn.EnvVars.DevStage == cn.DefaultDevStages.Production,
		Path:     "/",
	})
	return ftx.Status(fiber.StatusOK).JSON(&cn.ApiRes{ResType: cn.ResTypes.Success, Msg: "Successfully logged in! Redirecting to home page..."})
}

func (a *AuthHandlersConfig) HandleDeleteUser(ftx *fiber.Ctx) error {
	userEmail, err := utils.ExtractEmailFromClaim(ftx)
	if err != nil {
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(a.Db)

	_, err = q.SelectUser(ctx, userEmail)
	if err != nil {
		log.Println(err)
		return ftx.Status(fiber.StatusUnauthorized).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: cn.ErrsFitFin.UserValidation})
	}

	if err := q.DeleteUser(ctx, userEmail); err != nil {
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "User was NOT deleted!"})
	}

	ftx.Cookie(&fiber.Cookie{
		Name:     cn.PASETO_COOKIE_NAME,        // Replace with your cookie name
		Value:    "",                           // Clear the cookie value
		Expires:  time.Now().AddDate(0, 0, -1), // Set expiration to the past
		HTTPOnly: true,                         // Ensure it's set as HttpOnly if needed
		Secure:   cn.EnvVars.DevStage == cn.DefaultDevStages.Production,
		SameSite: fiber.CookieSameSiteLaxMode,
		Path:     "/",
	})

	return ftx.Status(fiber.StatusNoContent).JSON(&cn.ApiRes{ResType: cn.ResTypes.Success, Msg: "User was deleted successfully!"})
}

func HandleGetGoogleSignIn(ftx *fiber.Ctx) error {
	randString := cn.GenerateRandomString(20)
	url := cn.OAuthConfigFitFin.AuthCodeURL(randString)
	return ftx.Status(fiber.StatusOK).JSON(map[string]interface{}{"googleUrl": url})
}

func (a *AuthHandlersConfig) HandleGetGoogleCallback(ftx *fiber.Ctx) error {
	state := ftx.Query("state")
	if state != cn.GoogleState {
		return ftx.Redirect(cn.EnvVars.FrontEndUrl)
	}
	code := ftx.Query("code")
	gToken, err := cn.OAuthConfigFitFin.Exchange(context.Background(), code)
	if err != nil {
		ftx.Redirect(cn.EnvVars.FrontEndUrl)
	}

	resp, err := http.Get(cn.GOOGLE_API_OAUTH2_URL + gToken.AccessToken)
	if err != nil {
		return ftx.Redirect(cn.EnvVars.FrontEndUrl)
	}
	defer resp.Body.Close()
	userDataByte, err := io.ReadAll(resp.Body)
	if err != nil {
		return ftx.Redirect(cn.EnvVars.FrontEndUrl)
	}
	var userData cn.OAuthResp
	if err := json.Unmarshal(userDataByte, &userData); err != nil {
		return ftx.Redirect(cn.EnvVars.FrontEndUrl)
	}

	q := sqlc.New(a.Db)
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	user, err := q.SelectUser(ctx, userData.Email)
	log.Println(user)

	if err != nil {
		if err == sql.ErrNoRows {
			randString := cn.GenerateRandomString(20)
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
	tokenString, err := token.PasetoMakerGlobal.CreateToken(userData.Email, cn.PASETO_ACCESS_TOKEN_DURATION)
	if err != nil {
		log.Println("Failed to generate token string:", err)
		return ftx.Status(fiber.StatusInternalServerError).JSON(&cn.ApiRes{ResType: cn.ResTypes.Err, Msg: "Failed to log in the user. Please try again later!"})
	}

	// emailToken, err := utils.GenerateSecureToken(16)
	// if err != nil {
	// 	log.Println("failed to store the token in redis for email in redux", err)
	// }
	// if err := redisutils.SetRedisKeyString(a.Rdb, emailToken, userData.Email, 5*time.Minute); err != nil {
	// 	log.Println(err)
	// } else {
	// 	log.Println("email saved in redis for redux")
	// }

	ftx.Cookie(&fiber.Cookie{
		Name:     cn.PASETO_COOKIE_NAME,
		Value:    tokenString,
		HTTPOnly: true,
		Expires:  cn.COOKIE_EXPIRATION_TIME,
		SameSite: fiber.CookieSameSiteLaxMode,
		Secure:   cn.EnvVars.DevStage == cn.DefaultDevStages.Production,
		Path:     "/",
	})

	return ftx.Redirect(cn.EnvVars.FrontEndUrl)
}

// func (a *AuthHandlersConfig) GetEmailFromTokenHandler(ftx *fiber.Ctx) error {
// 	token := ftx.Query("token")

// 	email, err := redisutils.GetRedisKeyString(a.Rdb, token)
// 	if err != nil {
// 		log.Println(err)
// 		return ftx.SendStatus(fiber.StatusNotFound)
// 	}

// 	return ftx.Status(fiber.StatusOK).JSON(fiber.Map{"email": email})
// }
