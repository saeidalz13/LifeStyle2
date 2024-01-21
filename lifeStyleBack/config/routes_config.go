package config

type ProjUrls struct {
	Home          string
	UpdateBudget  string
	PostNewBudget string

	//Auth
	SignUp        string
	Login         string
	SignOut       string
	OAuthSignIn   string
	OAuthCallback string

	Finance           string
	ShowBudgets       string
	EachBudget        string
	EachExpense       string
	AllExpensesBudget string
	EachBalance       string
	Profile           string
	DeleteProfile     string

	// Fitness
	FetchSinglePlan          string
	FetchDayPlanMovesWorkout string
	FetchPlanRecords         string
	AddPlan                  string
	DeletePlan               string
	DeleteDayPlan            string
	DeleteDayPlanMove        string
	EditPlan                 string
	AllPlans                 string
	AllDayPlans              string
	AllDayPlanMoves          string
	AddDayPlanMoves          string
	AddPlanRecord            string

	// GPT
	GptApi string
}

var URLS = &ProjUrls{
	// Auth and General
	Home:          "/",
	SignUp:        "/signup",
	Login:         "/login",
	SignOut:       "/signout",
	OAuthSignIn:   "/google-sign-in",
	OAuthCallback: "/google-callback",

	// User
	Profile:       "/profile",
	DeleteProfile: "/delete-profile",

	// Finance
	Finance:           "/finance",
	ShowBudgets:       "/finance/show-all-budgets",
	PostNewBudget:     "/finance/create-new-budget",
	EachBudget:        "/finance/show-all-budgets/:id",
	EachExpense:       "/finance/submit-expenses/:id",
	AllExpensesBudget: "/finance/show-expenses/:id",
	EachBalance:       "/finance/balance/:id",
	UpdateBudget:      "/finance/update-budget/:id",

	// Fitness
	FetchSinglePlan:          "/fitness/plan/:id",
	FetchDayPlanMovesWorkout: "/fitness/start-workout/:id",
	FetchPlanRecords:         "/fitness/plan-records/:id",
	AddPlan:                  "/fitness/add-plan",
	EditPlan:                 "/fitness/edit-plan/:id",
	DeletePlan:               "/fitness/delete-plan/:id",
	DeleteDayPlan:            "/fitness/delete-day-plan/:id",
	DeleteDayPlanMove:        "/fitness/delete-day-plan-move/:id",
	AllPlans:                 "/fitness/all-plans",
	AllDayPlans:              "/fitness/all-day-plans/day-plans/:id",
	AllDayPlanMoves:          "/fitness/all-day-plans/day-plan-moves/:id",
	AddDayPlanMoves:          "/fitness/all-day-plans/add-moves/:id",
	AddPlanRecord:            "/fitness/add-plan-record/:id",
}