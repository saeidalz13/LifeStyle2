package handlers

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"testing"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	sqlc "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/token"
	// "golang.org/x/oauth2"
	// "golang.org/x/oauth2/google"
)

const TEST_DB_DRIVER = "postgres"

var DB_TEST *sql.DB
var TestAuthHandlerReqs *AuthHandlerReqs
var TestFinanceHandlerReqs *FinanceHandlerReqs

func determineMigrationDrive() string {
	return "file:../db/migration"

}

func execMigrations(migrationDir string) error {
	driver, err := postgres.WithInstance(DB_TEST, &postgres.Config{})
	m, err := migrate.NewWithDatabaseInstance(
		migrationDir,
		// databaseName (random string for logging)
		"lfdb",
		// Driver
		driver,
	)
	if err != nil {
		return err
	}
	// or m.Step(2) if you want to explicitly set the number of migrations to run
	if err = m.Up(); err != nil {
		if err.Error() == cn.ErrsFitFin.NoChangeMigration {
			// If no new migration, just start the server
			return nil
		}
		return err
	}
	return nil
}

func ensureFitnessMovesAvailability() error {
	// Add move types
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(DB_TEST)
	for _, moveType := range cn.MOVE_TYPES_SLICE {
		if err := q.AddMoveType(ctx, moveType); err != nil {
			return err
		}
	}

	for i, moves := range cn.ALL_MOVES {
		mType, err := q.FetchMoveTypeId(ctx, cn.MOVE_TYPES_SLICE[i])
		if err != nil {
			return fmt.Errorf(cn.ErrsFitFin.InvalidMoveType)
		}
		for _, move := range moves {
			if err := q.AddMoves(ctx, sqlc.AddMovesParams{
				MoveName:   move,
				MoveTypeID: mType.MoveTypeID,
			}); err != nil {
				return fmt.Errorf(cn.ErrsFitFin.MoveInsertion)
			}
		}
	}
	return nil
}

// Entry point of all the tests in handlers package
func TestMain(m *testing.M) {
	// googleOAuthConfig := &oauth2.Config{
	// 	RedirectURL:  envVarsTest.GRedirUrl,
	// 	ClientID:     envVarsTest.GClientId,
	// 	ClientSecret: envVarsTest.GClientSec,
	// 	Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email"},
	// 	Endpoint:     google.Endpoint,
	// }

	randomString32Chars := "c808cd4bc8639e0808216f5180277189"

	cn.EnvVars = &cn.DotEnvVars{
		DbTestUrl: "postgresql://root:testpassword@localhost:3200/lfdb?sslmode=disable",
		PasetoKey: randomString32Chars,
		DevStage:  "dev",
	}

	// cn.OAuthConfigFitFin = googleOAuthConfig
	tempPaseto, err := token.NewPasetoMaker(cn.EnvVars.PasetoKey)
	if err != nil {
		log.Fatalln("Failed to extract Paseto Key!")
	}
	token.PasetoMakerGlobal = tempPaseto

	DB_TEST, err := sql.Open(TEST_DB_DRIVER, cn.EnvVars.DbTestUrl)
	if err != nil {
		log.Println(err)
	}
	if err = DB_TEST.Ping(); err != nil {
		DB_TEST.Close()
		panic(err.Error())
	}
	log.Println("Connected to lifestyledb_test database...")
	DB_TEST.SetMaxOpenConns(cn.DB_MAX_OPEN_CONNECTIONS)
	DB_TEST.SetMaxIdleConns(cn.DB_MAX_IDLE_CONNECTIONS)
	DB_TEST.SetConnMaxLifetime(cn.DB_MAX_CONNECTION_LIFETIME)

	migrationDir := determineMigrationDrive()

	driver, err := postgres.WithInstance(DB_TEST, &postgres.Config{})
	migrateDb, err := migrate.NewWithDatabaseInstance(
		migrationDir,
		"lfdb",
		driver,
	)
	if err != nil {
		panic("Failed to read migration files")
	}
	migrateDb.Up()

	TestAuthHandlerReqs = &AuthHandlerReqs{
		Db: DB_TEST,
	}
	TestFinanceHandlerReqs = &FinanceHandlerReqs{
		Db: DB_TEST,
	}

	os.Exit(m.Run())
}
