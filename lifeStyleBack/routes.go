package main

import "github.com/gofiber/fiber/v2"

func Setup(app *fiber.App) {
	app.Get(URLS.Home, GetHome)
	app.Get(URLS.Finance, IsLoggedIn, GetFinance)
	app.Post(URLS.SignUp, PostSignup)
	app.Post(URLS.Login, PostLogin)
}