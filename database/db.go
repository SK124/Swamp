package database

import (
    "fmt"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
    "swamp/models"

)

//Setting up Postgres DB, I am using GORM
func ConnectDB() (*gorm.DB, error) {
    dsn := "host=localhost user=postgres password=postgres dbname=swamp port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}
    //Setting up migration for swamp table, need to do for other models as well. 
	err = db.AutoMigrate(&models.User{})
	if err != nil {
		return nil, fmt.Errorf("failed to auto migrate: %w", err)
	}

	fmt.Println("Database connected and tables migrated successfully!")
	return db, nil
}