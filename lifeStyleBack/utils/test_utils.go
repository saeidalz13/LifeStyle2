package utils

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
)

func CheckResp(app *fiber.App, req *http.Request, expectedStatusCode int) error {
	resp, err := app.Test(req, cn.TEST_REQUEST_TIMEOUT_MS)
	if err != nil {
		return err
	}
	if resp.StatusCode != expectedStatusCode {
		return fmt.Errorf("Expected status %d, but got %d", fiber.StatusUnauthorized, resp.StatusCode)
	}
	return nil
}

func TestFails(app *fiber.App, req *http.Request) bool {
	resp, err := app.Test(req, cn.TEST_REQUEST_TIMEOUT_MS)
	if err != nil {
		return true
	}
	if resp.StatusCode != fiber.StatusUnauthorized {
		return true
	}
	return false
}

func SetUp() *sql.DB {
	db, err := sql.Open("postgres", cn.EnvVars.DbUrl)
	if err != nil {
		fmt.Println(err)
	}
	if err = db.Ping(); err != nil {
		db.Close()
		panic(err.Error())
	}
	fmt.Println("Connected to lifestyledb_test database...")

	driver, err := postgres.WithInstance(db, &postgres.Config{})
	m, err := migrate.NewWithDatabaseInstance(
		"file:../db/migration",
		"lfdb",
		driver,
	)
	if err != nil {
		panic("Failed to read migration files")
	}
	m.Up()

	return db
}
