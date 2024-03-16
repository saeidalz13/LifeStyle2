package middlewares

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/token"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
)

func IsLoggedIn(ftx *fiber.Ctx) error {
	cookie := ftx.Cookies("paseto")
	if cookie == "" {
		log.Println(cn.ErrsFitFin.CookiePasetoName)
		return ftx.SendStatus(fiber.StatusUnauthorized)
	}

	_, err := token.PasetoMakerGlobal.VerifyToken(cookie)
	if err != nil {
		log.Println(cn.ErrsFitFin.CookiePasetoValue)
		return ftx.SendStatus(fiber.StatusUnauthorized)
	}

	return ftx.Next()
}


type RedisHandler struct {
	// db
}

func (r *RedisHandler) CheckFinanceExpenseInRedis(ftx *fiber.Ctx) error {
	

	return ftx.Next()
}