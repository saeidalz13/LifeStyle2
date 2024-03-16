package database

import (
	"context"
	"database/sql"
	"log"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
	cn "github.com/saeidalz13/LifeStyle2/lifeStyleBack/config"
	sqlc "github.com/saeidalz13/LifeStyle2/lifeStyleBack/db/sqlc"
)

var DB *sql.DB

func mustDetermineMigrationDrive() string {
	if cn.EnvVars.DevStage == cn.DefaultDevStages.Production {
		return "file:migration"
	}
	if cn.EnvVars.DevStage == cn.DefaultDevStages.Development {
		return "file:db/migration"
	}

	panic(cn.ErrsFitFin.DevStage)
}

func mustExecMigrations(migrationDir string) {
	driver, err := postgres.WithInstance(DB, &postgres.Config{})
	if err != nil {
		panic(err)
	}

	m, err := migrate.NewWithDatabaseInstance(
		migrationDir,
		// databaseName (random string for logging)
		"lfdb",
		// Driver
		driver,
	)
	if err != nil {
		panic(err)
	}
	// or m.Step(2) if you want to explicitly set the number of migrations to run
	if err = m.Up(); err != nil {
		if err.Error() == cn.ErrsFitFin.NoChangeMigration {
			// If no new migration, just start the server
			return
		}
		panic(err)
	}
}

func mustCreateFitnessMovesForDb() {
	// Add move types
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()
	q := sqlc.New(DB)
	for _, moveType := range cn.MOVE_TYPES_SLICE {
		if err := q.AddMoveType(ctx, moveType); err != nil {
			panic(err)
		}
	}

	for i, moves := range cn.ALL_MOVES {
		mType, err := q.FetchMoveTypeId(ctx, cn.MOVE_TYPES_SLICE[i])
		if err != nil {
			panic(cn.ErrsFitFin.InvalidMoveType)
		}
		for _, move := range moves {
			if err := q.AddMoves(ctx, sqlc.AddMovesParams{
				MoveName:   move,
				MoveTypeID: mType.MoveTypeID,
			}); err != nil {
				panic(cn.ErrsFitFin.MoveInsertion)
			}
		}
	}
}

func MustConnectToDb() {
	db, err := sql.Open("postgres", cn.EnvVars.DbUrl)
	if err != nil {
		panic(cn.ErrsFitFin.PostgresConn)
	}
	if err = db.Ping(); err != nil {
		db.Close()
		panic(err.Error())
	}
	log.Println("Connected to database!")

	db.SetMaxOpenConns(cn.DB_MAX_OPEN_CONNECTIONS)
	db.SetMaxIdleConns(cn.DB_MAX_IDLE_CONNECTIONS)
	db.SetConnMaxLifetime(cn.DB_MAX_CONNECTION_LIFETIME)
	DB = db

	migrationDir := mustDetermineMigrationDrive()
	mustExecMigrations(migrationDir)
	mustCreateFitnessMovesForDb()
	log.Println("possible migrations were successful!")
}
