package database

import (
	"fmt"
	"log"
	// "swamp/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB // Global variable to hold the database connection

// ConnectDB initializes the PostgreSQL database connection
func ConnectDB() *gorm.DB {
	dsn := "host=localhost user=postgres dbname=postgres password=swamp port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to the database:", err)
	}

	AutoMigrate all models
	err = db.AutoMigrate(&models.User{}, &models.OTP{}, &models.Swamp{})
	if err != nil {
		log.Fatalf("Failed to migrate database %v:", err)
	}

	DB = db // Assign database instance to the global DB variable
	fmt.Println("Database connected and tables migrated successfully!")
	return DB
}
