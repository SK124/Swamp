package main

import (
	"log"
	"net/http"

	"swamp/database"
	"swamp/routers"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"gorm.io/gorm"
)

var db *gorm.DB

func setupDatabase() *gorm.DB {
	db = database.ConnectDB()
	// if err != nil {
	//     log.Fatal("Database connection failed:", err)
	// }

	// Ensuring I am able to create a user.
	// user := models.User{Username: "Dobra"}
	// result := db.Create(&user)

	// if result.Error != nil {
	// 	log.Fatalf("Failed to create user: %v", result.Error)
	// }

	// // AutoMigrate models
	// db.AutoMigrate(&models.User{})
	return db
}

func main() {

	db = setupDatabase()

	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		// Allow specific origin
		AllowedOrigins:   []string{"http://localhost:5173"}, // Add your frontend URL here
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}))
	routers.SetupRoutes(r)
	// Start server
	log.Println("Server starting on :8080")
	http.ListenAndServe(":8080", r)
}
