package main

import (
	"database/sql"

	_ "github.com/go-sql-driver/mysql"
)

func ConnectMySql() (*sql.DB, error) {
	consts, err := GetEnvVars(); 
	if err != nil {
		return nil, err
	}

	db, err := sql.Open("mysql", "root:"+consts.mySqlPassword+"@tcp(localhost:3306)/"+consts.dataBaseName)
	if err != nil {
		return nil, err
	}

	// Check if the connection is valid
	if err = db.Ping(); err != nil {
		db.Close()
		return nil, err
	}

	return db, nil
}