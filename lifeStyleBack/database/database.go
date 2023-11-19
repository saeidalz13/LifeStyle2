package database

import (
	"database/sql"
	"log"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
)

var DB *sql.DB

func ConnectToDb() {
	log.Println(cn.EnvVars.DbUrl)

	db, err := sql.Open("postgres", cn.EnvVars.DbUrl)
	if err != nil {
		log.Println(err)
		log.Fatalln("Failed to connect to MySQL database")
	}
	// Check if the connection is valid
	if err = db.Ping(); err != nil {
		db.Close()
		panic(err.Error())
	}

	log.Println("Connected to database...")
	DB = db

	var migrationDir string
	if cn.EnvVars.DevStage == cn.DevStages.Production {
		migrationDir = "file:migration"
	} else if cn.EnvVars.DevStage == cn.DevStages.Development {
		migrationDir = "file:db/migration"
	} else {
		log.Fatalln("Invalid dev stage")
	}

	driver, err := postgres.WithInstance(db, &postgres.Config{})
	m, err := migrate.NewWithDatabaseInstance(
		migrationDir,
		// databaseName (random string for logging)
		"lfdb",
		// Driver
		driver,
	)
	if err != nil {
		log.Fatalln(err)
	}

	m.Up()
	// or m.Step(2) if you want to explicitly set the number of migrations to run

}
