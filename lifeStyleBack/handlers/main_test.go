package handlers

import (
	"database/sql"
	"log"
	"os"
	"testing"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
)

const TEST_DB_DRIVER = "postgres"


var TestAuthHandlerReqs *AuthHandlerReqs
var TestFinanceHandlerReqs *FinanceHandlerReqs


// Entry point of all the tests in handlers package
func TestMain(m *testing.M) {
	db, err := sql.Open(TEST_DB_DRIVER, cn.EnvVars.DbUrl)
	if err != nil {
		log.Println(err)
	}
	if err = db.Ping(); err != nil {
		db.Close()
		panic(err.Error())
	}
	log.Println("Connected to lifestyledb_test database...")

	driver, err := postgres.WithInstance(db, &postgres.Config{})
	migrateDb, err := migrate.NewWithDatabaseInstance(
		"file:../db/migration",
		"lfdb",
		driver,
	)
	if err != nil {
		panic("Failed to read migration files")
	}
	migrateDb.Up()

	TestAuthHandlerReqs = &AuthHandlerReqs{cn.GeneralHandlerReqs{Db: db}}
	TestFinanceHandlerReqs = &FinanceHandlerReqs{cn.GeneralHandlerReqs{Db: db}}

	os.Exit(m.Run())
}
