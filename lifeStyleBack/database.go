package main

import (
	"database/sql"
	"log"
	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func ConnectToDb(envConsts *DotEnvVars) {
	db, err := sql.Open("mysql", "root:"+envConsts.mySqlPassword+"@tcp(localhost:3306)/"+envConsts.dataBaseName)
	if err != nil {
		log.Fatalln("Failed to connect to MySQL database")
		panic(err.Error())
	}
	// Check if the connection is valid
	if err = db.Ping(); err != nil {
		db.Close()
		panic(err.Error())
	}
	log.Println("Connected to database...")
	DB = db
}
