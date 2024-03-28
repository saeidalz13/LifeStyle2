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
	ReduxEmail    string
	Profile       string
	DeleteProfile string

	// Finance
	Finance               string
	ShowBudgets           string
	EachBudget            string
	EachExpense           string
	AllExpensesBudget     string
	CapitalExpenses       string
	EatoutExpenses        string
	EntertainmentExpenses string

	EachBalance                 string
	UpdateCapitalExpenses       string
	UpdateEatoutExpenses        string
	UpdateEntertainmentExpenses string
	DeleteCapitalExpense        string
	DeleteEatoutExpense         string
	DeleteEntertainmentExpense  string

	// Fitness
	FetchSinglePlan                   string
	FetchDayPlanMovesWorkout          string
	FetchPlanRecords                  string
	FetchWeekPlanRecords              string
	FetchNumAvailableWeeksPlanRecords string
	AddPlan                           string
	DeletePlan                        string
	DeleteDayPlan                     string
	DeleteDayPlanMove                 string
	EditPlan                          string
	AllPlans                          string
	AllDayPlans                       string
	AllDayPlanMoves                   string
	AddDayPlanMoves                   string
	AddPlanRecord                     string
	DeleteWeekPlanRecords             string
	UpdatePlanRecord                  string
	DeletePlanRecord                  string

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
	ReduxEmail:    "/retrieve-email-redux-from-google-token",

	// User
	Profile:       "/profile",
	DeleteProfile: "/delete-profile",

	// Finance
	Finance:                     "/finance",
	ShowBudgets:                 "/finance/show-all-budgets",
	PostNewBudget:               "/finance/create-new-budget",
	EachBudget:                  "/finance/show-all-budgets/:id",
	EachExpense:                 "/finance/submit-expenses/:id",
	AllExpensesBudget:           "/finance/show-expenses/:id",
	CapitalExpenses:             "/finance/show-capital-expenses/:id",
	EatoutExpenses:              "/finance/show-eatout-expenses/:id",
	EntertainmentExpenses:       "/finance/show-entertainment-expenses/:id",
	EachBalance:                 "/finance/balance/:id",
	UpdateBudget:                "/finance/update-budget/:id",
	UpdateCapitalExpenses:       "/finance/update-capital-expenses",
	UpdateEatoutExpenses:        "/finance/update-eatout-expenses",
	UpdateEntertainmentExpenses: "/finance/update-entertainment-expenses",
	DeleteCapitalExpense:        "/finance/delete-capital-expenses",
	DeleteEatoutExpense:         "/finance/delete-eatout-expenses",
	DeleteEntertainmentExpense:  "/finance/delete-entertainment-expenses",

	// Fitness
	FetchSinglePlan:                   "/fitness/plan/:id",
	FetchDayPlanMovesWorkout:          "/fitness/start-workout/:id",
	FetchPlanRecords:                  "/fitness/plan-records/:id",
	FetchWeekPlanRecords:              "/fitness/plan-records/:dayPlanId/:week",
	FetchNumAvailableWeeksPlanRecords: "/fitness/num-available-weeks/:dayPlanId",
	AddPlan:                           "/fitness/add-plan",
	EditPlan:                          "/fitness/edit-plan/:id",
	AllPlans:                          "/fitness/all-plans",
	AllDayPlans:                       "/fitness/all-day-plans/day-plans/:id",
	AllDayPlanMoves:                   "/fitness/all-day-plans/day-plan-moves/:id",
	AddDayPlanMoves:                   "/fitness/all-day-plans/add-moves/:id",
	AddPlanRecord:                     "/fitness/add-plan-record/:id",
	UpdatePlanRecord:                  "/fitness/update-plan-record",
	DeletePlan:                        "/fitness/delete-plan/:id",
	DeleteDayPlan:                     "/fitness/delete-day-plan/:id",
	DeleteDayPlanMove:                 "/fitness/delete-day-plan-move/:id",
	DeleteWeekPlanRecords:             "/fitness/delete-week-plan-records",
	DeletePlanRecord:                  "/fitness/delete-plan-record",
}
