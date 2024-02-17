package utils

import (
	"context"
	"fmt"
	"log"
	"regexp"
	"strings"

	"github.com/gofiber/fiber/v2"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	sqlc "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/token"
)

func ExtractEmailFromClaim(ftx *fiber.Ctx) (string, error) {
	cookie := ftx.Cookies("paseto")
	if cookie == "" {
		return "", fmt.Errorf(cn.ErrsFitFin.CookiePasetoName)
	}

	payload, err := token.PasetoMakerGlobal.VerifyToken(cookie)
	if err != nil {
		return "", fmt.Errorf(cn.ErrsFitFin.CookiePasetoValue)
	}
	return payload.Email, nil
}

func ValidateContentType(ftx *fiber.Ctx) error {
	if contentType := ftx.Get("Content-Type"); !strings.Contains(contentType, "json") {
		log.Println("Unsupported Content-Type:", contentType)
		return fmt.Errorf(cn.ErrsFitFin.ContentType)
	}
	return nil
}

func InitialNecessaryValidationsGetReqs(ftx *fiber.Ctx, ctx context.Context, q *sqlc.Queries) (*sqlc.User, error) {
	userEmail, err := ExtractEmailFromClaim(ftx)
	if err != nil {
		return nil, err
	}
	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func InitialNecessaryValidationsDeleteReqs(ftx *fiber.Ctx, ctx context.Context, q *sqlc.Queries) (*sqlc.User, error) {
	userEmail, err := ExtractEmailFromClaim(ftx)
	if err != nil {
		return nil, err
	}
	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func InitialNecessaryValidationsPostReqs(ftx *fiber.Ctx, ctx context.Context, q *sqlc.Queries) (*sqlc.User, error) {
	if err := ValidateContentType(ftx); err != nil {
		return nil, err
	}
	userEmail, err := ExtractEmailFromClaim(ftx)
	if err != nil {
		return nil, err
	}
	user, err := q.SelectUser(ctx, userEmail)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func ValidateEmail(email string) error {
	regex, err := regexp.Compile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)
	if err != nil {
		return err
	}
	if !regex.MatchString(email) {
		return fmt.Errorf("user-provided email does NOT have proper email format")
	}
	return nil
}

func ValidatePassword(password string) error {
	if len(password) < cn.PASSWORD_MIN_LEN {
		return fmt.Errorf("password must be a minimum of %d characters", cn.PASSWORD_MIN_LEN)
	}

	uppercaseRegex, err := regexp.Compile(`[A-Z]`)
	if err != nil {
		return err
	}

	digitRegex, err := regexp.Compile(`\d`)
	if err != nil {
		return err
	}

	if !uppercaseRegex.MatchString(password) || !digitRegex.MatchString(password) {
		return fmt.Errorf("password must contain at least one uppercase letter and one digit")
	}

	return nil
}
