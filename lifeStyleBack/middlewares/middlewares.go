package middlewares

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/token"
)

func IsLoggedIn(ftx *fiber.Ctx) error {
	cookie := ftx.Cookies("paseto")
	if cookie == "" {
		return errors.New("Invalid JWT")
	}

	_, err := token.PasetoMakerGlobal.VerifyToken(cookie)
	if err != nil {
		return errors.New("Invalid JWT")
	}

	return ftx.Next()
}
