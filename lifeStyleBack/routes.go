package main

import "github.com/gofiber/fiber/v2"

func Setup(app *fiber.App) {
	app.Get(URLS.Home, GetHome)
	app.Get(URLS.Finance, IsLoggedIn, GetFinance)
	app.Get(URLS.SignOut, GetSignOut)
	app.Get(URLS.ShowBudgets, IsLoggedIn, GetAllBudgets)

	app.Post(URLS.SignUp, PostSignup)
	app.Post(URLS.Login, PostLogin)
	app.Post(URLS.PostNewBudget, IsLoggedIn, PostNewBudget)
}