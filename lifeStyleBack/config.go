package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type ProjUrls struct {
	Home          string
	PostNewBudget string
	SignUp        string
	Login         string
	SignOut       string
	Finance       string
	ShowBudgets   string
	EachBudget    string
	EachExpense   string
}

var URLS = &ProjUrls{
	Home:          "/",
	SignUp:        "/signup",
	Login:         "/login",
	SignOut:       "/signout",
	Finance:       "/finance",
	ShowBudgets:   "/finance/show-all-budgets",
	PostNewBudget: "/finance/create-new-budget",
	EachBudget:    "/finance/show-all-budgets/:id",
	EachExpense:   "/finance/submit-expenses/:id",
}

type DotEnvVars struct {
	frontEndUrl   string
	port          string
	mySqlPassword string
	dataBaseName  string
	JwtToken      string
	IpIssuer      string
}

func GetEnvVars() (*DotEnvVars, error) {
	if err := godotenv.Load(".env"); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
		return nil, err
	}

	return &DotEnvVars{
		frontEndUrl:   os.Getenv("FRONTENDURL"),
		port:          os.Getenv("PORT"),
		mySqlPassword: os.Getenv("MYSQLPASSWORD"),
		dataBaseName:  os.Getenv("DATABASENAME"),
		JwtToken:      os.Getenv("JWTTOKEN"),
		IpIssuer:      os.Getenv("IPISSUER"),
	}, nil
}
