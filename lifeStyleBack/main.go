package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"

	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	database "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/routes"
	h "github.com/saeidalz13/LifeStyle2/lifeStyleBack/handlers"
)

var ( 
	DefaultAuthHandlerReqs = &h.AuthHandlerReqs{}
	DefaultFinanceHandlerReqs = &h.FinanceHandlerReqs{}
)

func main() {
	database.ConnectToDb()
	app := fiber.New()
	app.Use(logger.New())
	DefaultAuthHandlerReqs.Db = database.DB
	DefaultFinanceHandlerReqs.Db = database.DB

	app.Use(cors.New(cors.Config{
		AllowHeaders:     "Origin,Content-Type,Accept,Content-Length,Accept-Language,Accept-Encoding,Connection,Access-Control-Allow-Origin,X-CSRF-Token,Set-Cookie,Authorization",
		AllowOrigins:     cn.EnvVars.FrontEndUrl,
		AllowMethods:     "GET,POST,HEAD,PUT,DELETE,PATCH,OPTIONS",
		AllowCredentials: true,
		MaxAge:           300,
	}))

	routes.Setup(app, DefaultAuthHandlerReqs, DefaultFinanceHandlerReqs)

	log.Printf("Listening to port %v...", cn.EnvVars.Port)
	app.Listen(cn.EnvVars.Port)
}
