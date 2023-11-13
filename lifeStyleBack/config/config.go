package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

var EnvVars *DotEnvVars

type DotEnvVars struct {
	FrontEndUrl   string
	Port          string
	MySqlPassword string
	DataBaseName  string
	JwtToken      string
	IpIssuer      string
	PasetoKey     string
}

type ProjUrls struct {
	Home              string
	PostNewBudget     string
	SignUp            string
	Login             string
	SignOut           string
	Finance           string
	ShowBudgets       string
	EachBudget        string
	EachExpense       string
	AllExpensesBudget string
	EachBalance       string
}

var URLS = &ProjUrls{
	Home:              "/",
	SignUp:            "/signup",
	Login:             "/login",
	SignOut:           "/signout",
	Finance:           "/finance",
	ShowBudgets:       "/finance/show-all-budgets",
	PostNewBudget:     "/finance/create-new-budget",
	EachBudget:        "/finance/show-all-budgets/:id",
	EachExpense:       "/finance/submit-expenses/:id",
	AllExpensesBudget: "/finance/show-expenses/:id",
	EachBalance:       "/finance/balance/:id",
}

func GetEnvVars() (*DotEnvVars, error) {
	// // Set the working directory
	// err := os.Chdir("/app")
	// if err != nil {
	// 	panic(err)
	// }

	if err := godotenv.Load(".env"); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
		return nil, err
	}

	return &DotEnvVars{
		FrontEndUrl:   os.Getenv("FRONTENDURL"),
		Port:          os.Getenv("PORT"),
		MySqlPassword: os.Getenv("MYSQLPASSWORD"),
		DataBaseName:  os.Getenv("DATABASENAME"),
		JwtToken:      os.Getenv("JWTTOKEN"),
		IpIssuer:      os.Getenv("IPISSUER"),
		PasetoKey:     os.Getenv("PASETO_KEY"),
	}, nil
}

func init() {
	envConsts, err := GetEnvVars()
	if err != nil {
		log.Println("Failed to retrieve data from dotenv file")
		panic(err.Error())
	}
	EnvVars = envConsts
}
