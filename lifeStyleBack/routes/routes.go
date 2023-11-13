package routes

import (
	"github.com/gofiber/fiber/v2"
	h "github.com/saeidalz13/LifeStyle2/lifeStyleBack/handlers"
	m "github.com/saeidalz13/LifeStyle2/lifeStyleBack/middlewares"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
)

func Setup(app *fiber.App) {

	// Get
	app.Get(cn.URLS.Home, h.GetHome)
	app.Get(cn.URLS.SignOut, h.GetSignOut)
	app.Get(cn.URLS.ShowBudgets, m.IsLoggedIn, h.GetAllBudgets)
	app.Get(cn.URLS.EachBudget, m.IsLoggedIn, h.GetBudget)
	app.Get(cn.URLS.Finance, m.IsLoggedIn, h.GetFinance)
	app.Get(cn.URLS.AllExpensesBudget, m.IsLoggedIn, h.GetAllExpenses)
	app.Get(cn.URLS.EachBalance, m.IsLoggedIn, h.GetSingleBalance)

	// Post
	app.Post(cn.URLS.SignUp, h.PostSignup)
	app.Post(cn.URLS.Login, h.PostLogin)
	app.Post(cn.URLS.PostNewBudget, m.IsLoggedIn, h.PostNewBudget)
	app.Post(cn.URLS.EachExpense, m.IsLoggedIn, h.PostExpenses)

	// Delete
	app.Delete(cn.URLS.EachBudget, m.IsLoggedIn, h.DeleteBudget)

	// Patch
	app.Patch(cn.URLS.EachBudget, m.IsLoggedIn, h.PatchBudget)
}
