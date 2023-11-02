package main

import (
	"log"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

var ENVCONSTS *DotEnvVars

func main() {
	envConsts, err := GetEnvVars()
	if err != nil {
		log.Println("Failed to retrieve data from dotenv file")
		panic(err.Error())
	}
	ENVCONSTS = envConsts

	ConnectToDb(envConsts)
	app := fiber.New()
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowHeaders:     "Origin,Content-Type,Accept,Content-Length,Accept-Language,Accept-Encoding,Connection,Access-Control-Allow-Origin,X-CSRF-Token,Set-Cookie,Authorization",
		AllowOrigins:     envConsts.frontEndUrl,
		AllowMethods:     "GET,POST,HEAD,PUT,DELETE,PATCH,OPTIONS",
		AllowCredentials: true,
		MaxAge:           300,
	}))

	Setup(app)
	app.Listen(envConsts.port)

}

// // Create a struct to be able to pass the db instance to the handlers
// userHandler := &UserHandler{DB: db}

// // Initialize the router
// r := chi.NewRouter()
// r.Use(middleware.Logger)
// r.Use(middleware.Timeout(60 * time.Second))

// // Set the CORS options
// corsOptions := cors.New(
// 	cors.Options{
// 		AllowedOrigins:   []string{envConsts.frontEndUrl},
// 		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
// 		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "Set-Cookie"},
// 		AllowCredentials: true,
// 		MaxAge:           300, // Maximum age for preflight requests (seconds)
// 	})
// r.Use(corsOptions.Handler)

// // Get Functions
// r.Get(URLS.Home, HandlerGetHome)

// // Post Functions
// r.Post(URLS.PostNewBudget, HandlerPostNewBudget)
// r.Post(URLS.SignUp, userHandler.HandlerPostUserSignup)
// r.Post(URLS.Login, userHandler.HandlerPostUserLogin)

// // Initialize the server
// log.Printf("Listening to %s ...\n", envConsts.port)
// server := &http.Server{
// 	Addr:    envConsts.port,
// 	Handler: r,
// }
// log.Fatal(server.ListenAndServe())
