package main

import "github.com/gofiber/fiber/v2"

func Setup(app *fiber.App) {

	// Get
	app.Get(URLS.Home, GetHome)
	app.Get(URLS.SignOut, GetSignOut)
	app.Get(URLS.ShowBudgets, IsLoggedIn, GetAllBudgets)
	app.Get(URLS.EachBudget, IsLoggedIn, GetBudget)
	app.Get(URLS.Finance, IsLoggedIn, GetFinance)
	app.Get(URLS.AllExpensesBudget, IsLoggedIn, GetAllExpenses)
	app.Get(URLS.EachBalance, IsLoggedIn, GetSingleBalance)

	// Post
	app.Post(URLS.SignUp, PostSignup)
	app.Post(URLS.Login, PostLogin)
	app.Post(URLS.PostNewBudget, IsLoggedIn, PostNewBudget)
	app.Post(URLS.EachExpense, IsLoggedIn, PostExpenses)

	// Delete
	app.Delete(URLS.EachBudget, IsLoggedIn, DeleteBudget)

	// Patch
	app.Patch(URLS.EachBudget, IsLoggedIn, PatchBudget)
}
