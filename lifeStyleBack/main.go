package main

import (
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	consts := GetEnvVars()
	urls := Urls()
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Timeout(60 * time.Second))

	// Set the CORS options
	corsOptions := cors.New(
		cors.Options{
			AllowedOrigins:   []string{"http://localhost:5173"},
			AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
			AllowCredentials: true,
			MaxAge:           300, // Maximum age for preflight requests (seconds)
		})
	r.Use(corsOptions.Handler)
	// Get Functions
	r.Get(urls.home, GetHome)

	// Post Functions

	log.Printf("Listening to %s ...\n", consts.port)
	log.Fatal(http.ListenAndServe(consts.port, r))
}
