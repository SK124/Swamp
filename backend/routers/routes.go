package routers

import (
	"net/http"
	"swamp/handlers"
	"gorm.io/gorm"

	"github.com/go-chi/chi/v5"
	"github.com/rs/cors"
)

//We need to add routes we want here
//Currently, I am just putting some dummy healthcheck and api endpoints
func SetupRoutes(db *gorm.DB) *chi.Mux{

	router := chi.NewRouter()
	router.Use(cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders: []string{"Link"},
		AllowCredentials: true,
		MaxAge: 300,
	}).Handler)


	router.Get("/user", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello, World!"))
	})

	router.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	router.Get("/api", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("API endpoint works!"))
	})

	router.Get("/ws", handlers.WSHandler)

	return router 
}
