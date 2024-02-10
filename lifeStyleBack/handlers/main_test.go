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
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	sqlc "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"
	"github.com/saeidalz13/LifeStyle2/lifeStyleBack/token"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
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

func getEnvVars() (*cn.DotEnvVars, error) {
	if err := godotenv.Load("../.env"); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
		return nil, err
	}

	return &cn.DotEnvVars{
		FrontEndUrl: os.Getenv("FRONTENDURL"),
		Port:        os.Getenv("PORT"),
		PasetoKey:   os.Getenv("PASETO_KEY"),
		DbUrl:       os.Getenv("DATABASE_URL"),
		DbTestUrl:   os.Getenv("DB_TEST_URL"),
		DevStage:    os.Getenv("DEV_STAGE"),
		GClientId:   os.Getenv("GOOGLE_CLIENT_ID"),
		GClientSec:  os.Getenv("GOOGLE_CLIENT_SEC"),
		GRedirUrl:   os.Getenv("GOOGLE_REDIRECT_URL"),
		GptApiKey:   os.Getenv("GPT_API_KEY"),
	}, nil
}

// Entry point of all the tests in handlers package
func TestMain(m *testing.M) {
	envVarsTest, err := getEnvVars()
	if err != nil {
		log.Println("Failed to retrieve data from dotenv file")
		panic(err.Error())
	}
	googleOAuthConfig := &oauth2.Config{
		RedirectURL:  envVarsTest.GRedirUrl,
		ClientID:     envVarsTest.GClientId,
		ClientSecret: envVarsTest.GClientSec,
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email"},
		Endpoint:     google.Endpoint,
	}

	tempPaseto, err := token.NewPasetoMaker(envVarsTest.PasetoKey)
	if err != nil {
		log.Fatalln("Failed to extract Paseto Key!")
	}

	cn.EnvVars = envVarsTest
	cn.OAuthConfigFitFin = googleOAuthConfig
	token.PasetoMakerGlobal = tempPaseto

	DB_TEST, err := sql.Open(TEST_DB_DRIVER, envVarsTest.DbTestUrl)
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
		GeneralHandlerReqs: cn.GeneralHandlerReqs{
			Db: DB_TEST,
		},
	}
	TestFinanceHandlerReqs = &FinanceHandlerReqs{
		GeneralHandlerReqs: cn.GeneralHandlerReqs{
			Db: DB_TEST,
		},
	}

	os.Exit(m.Run())
}
