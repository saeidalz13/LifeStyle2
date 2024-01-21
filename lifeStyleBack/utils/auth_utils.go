package utils

import (
	"context"
	"errors"
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	sqlc "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/token"
)

func ExtractEmailFromClaim(ftx *fiber.Ctx) (string, error) {
	cookie := ftx.Cookies("paseto")
	if cookie == "" {
		return "", errors.New("Invalid Paseto")
	}

	payload, err := token.PasetoMakerGlobal.VerifyToken(cookie)
	if err != nil {
		return "", errors.New("Invalid Paseto")
	}
	return payload.Email, nil
}

func ValidateContentType(ftx *fiber.Ctx) error {
	if contentType := ftx.Get("Content-Type"); !strings.Contains(contentType, "json") {
		log.Println("Unsupported Content-Type:", contentType)
		return errors.New(cn.ErrsFitFin.ContentType)
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
