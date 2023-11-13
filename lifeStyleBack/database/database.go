package database

import (
	"database/sql"
	"log"
	_ "github.com/go-sql-driver/mysql"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"

)

var DB *sql.DB

func ConnectToDb() {
	db, err := sql.Open("mysql", "root:"+cn.EnvVars.MySqlPassword+"@tcp(localhost:3306)/"+cn.EnvVars.DataBaseName)
	if err != nil {
		log.Fatalln("Failed to connect to MySQL database")
	}
	// Check if the connection is valid
	if err = db.Ping(); err != nil {
		db.Close()
		panic(err.Error())
	}
	log.Println("Connected to database...")
	DB = db
}
