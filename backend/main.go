package main

import (
	"log"
	"net/http"

	"swamp/database"
	
	"swamp/models"
    "swamp/routers"
	"gorm.io/gorm"
)


var db *gorm.DB

func setupDatabase() *gorm.DB{
    db, err := database.ConnectDB()
    if err != nil {
        log.Fatal("Database connection failed:", err)
    }
    
    // Ensuring I am able to create a user.
    user := models.User{Username: "Dobra"}
	result := db.Create(&user)
    
    if result.Error != nil {
		log.Fatalf("Failed to create user: %v", result.Error)
	}

    // AutoMigrate models
    db.AutoMigrate(&models.User{})
    return db 
}


func main() {

    db = setupDatabase()
    r := routers.SetupRoutes(db)
    // Start server
    log.Println("Server starting on :8080")
    http.ListenAndServe(":8080", r)
}