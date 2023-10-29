package main

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type ProjUrls struct {
	home string
}

type Constants struct {
	port string
}

func Urls() *ProjUrls {
	return &ProjUrls{
		home: "/",
	}
}

func GetEnvVars() *Constants {
	if err := godotenv.Load(".env"); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}
	return &Constants{
		port: os.Getenv(strings.ToUpper("PORT")),
	}
}	

