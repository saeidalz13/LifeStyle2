package routes

import (
	"github.com/gofiber/fiber/v2"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	h "github.com/saeidalz13/LifeStyle2/lifeStyleBack/handlers"
	m "github.com/saeidalz13/LifeStyle2/lifeStyleBack/middlewares"
)

func Setup(app *fiber.App) {

	// Get
	app.Get(cn.URLS.Home, h.GetHome)
	app.Get(cn.URLS.Profile, h.GetProfile)
	app.Get(cn.URLS.SignOut, h.GetSignOut)
	app.Get(cn.URLS.ShowBudgets, m.IsLoggedIn, h.GetAllBudgets)
	app.Get(cn.URLS.EachBalance, m.IsLoggedIn, h.GetSingleBalance)
	app.Get(cn.URLS.EachBudget, m.IsLoggedIn, h.GetSingleBudget)
	app.Get(cn.URLS.AllPlans, m.IsLoggedIn, h.GetAllFitnessPlans)
	app.Get(cn.URLS.AllDayPlans, m.IsLoggedIn, h.GetAllFitnessDayPlans)
	app.Get(cn.URLS.AllDayPlanMoves, m.IsLoggedIn, h.GetAllFitnessDayPlanMoves)

	// Post
	app.Post(cn.URLS.SignUp, h.PostSignUp)
	app.Post(cn.URLS.Login, h.PostLogin)
	app.Post(cn.URLS.PostNewBudget, m.IsLoggedIn, h.PostNewBudget)
	app.Post(cn.URLS.EachExpense, m.IsLoggedIn, h.PostExpenses)
	app.Post(cn.URLS.AllExpensesBudget, m.IsLoggedIn, h.GetAllExpenses)
	app.Post(cn.URLS.AddPlan, m.IsLoggedIn, h.PostAddPlan)
	app.Post(cn.URLS.EditPlan, m.IsLoggedIn, h.PostEditPlan)

	// Delete
	app.Delete(cn.URLS.EachBudget, m.IsLoggedIn, h.DeleteBudget)
	app.Delete(cn.URLS.DeleteProfile, m.IsLoggedIn, h.DeleteUser)
	app.Delete(cn.URLS.DeletePlan, m.IsLoggedIn, h.DeletePlan)

	// Patch
	app.Patch(cn.URLS.UpdateBudget, m.IsLoggedIn, h.PatchBudget)
}
