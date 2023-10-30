package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type ProjUrls struct {
	Home          string
	PostNewBudget string
}

type DotEnvVars struct {
	port          string
	mySqlPassword string
	dataBaseName  string
}

func Urls() *ProjUrls {
	return &ProjUrls{
		Home:          "/",
		PostNewBudget: "/new-budget",
	}
}

func GetEnvVars() (*DotEnvVars, error) {
	if err := godotenv.Load(".env"); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
		return nil, err
	}

	return &DotEnvVars{
		port:          os.Getenv("PORT"),
		mySqlPassword: os.Getenv("MYSQLPASSWORD"),
		dataBaseName:  os.Getenv("DATABASENAME"),
	}, nil
}
