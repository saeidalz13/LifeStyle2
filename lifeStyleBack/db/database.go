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

func ConnectToDb() {
	db, err := sql.Open("postgres", cn.EnvVars.DbUrl)
	if err != nil {
		log.Println(err)
		log.Fatalln(cn.ErrsFitFin.PostgresConn)
	}
	// Check if the connection is valid
	if err = db.Ping(); err != nil {
		db.Close()
		panic(err.Error())
	}

	log.Println("Connected to database...")
	DB = db

	var migrationDir string
	if cn.EnvVars.DevStage == cn.DefaultDevStages.Production {
		migrationDir = "file:migration"
	} else if cn.EnvVars.DevStage == cn.DefaultDevStages.Development {
		migrationDir = "file:db/migration"
	} else {
		log.Fatalln(cn.ErrsFitFin.DevStage)
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

	// or m.Step(2) if you want to explicitly set the number of migrations to run
	m.Up()

	// Initial necessary tables for Fitness module
	ctx, cancel := context.WithTimeout(context.Background(), cn.CONTEXT_TIMEOUT)
	defer cancel()

	// Add move types
	q := sqlc.New(db)
	for _, moveType := range cn.MOVE_TYPES_SLICE {
		if err := q.AddMoveType(ctx, moveType); err != nil {
			log.Panicln("Failed to add move types", err)
		}
	}

	// all the available moves
	// MUST be in the same order as the move types
	allMoves := [][]string{
		cn.CHEST_MOVES,
		cn.LEG_MOVES,
		cn.SHOULDER_MOVES,
		cn.BACK_MOVES,
		cn.BICEPS_MOVES,
		cn.TRICEPS_MOVES,
		cn.ABS_MOVE,
	}

	for i, moves := range allMoves {
		mType, err := q.FetchMoveTypeId(ctx, cn.MOVE_TYPES_SLICE[i])
		if err != nil {
			log.Panicln(cn.ErrsFitFin.InvalidMoveType)
		}
		for _, move := range moves {
			if err := q.AddMoves(ctx, sqlc.AddMovesParams{
				MoveName:   move,
				MoveTypeID: mType.MoveTypeID,
			}); err != nil {
				log.Panicln(cn.ErrsFitFin.MoveInsertion)
			}
		}
	}
}
