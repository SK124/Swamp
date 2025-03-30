package tests

import (
	"os"
	"swamp/database"
	"swamp/routers"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"gorm.io/gorm"
)

var testDB *gorm.DB

// TestMain is the entry point for all tests
func TestMain(m *testing.M) {
	// Setup the test database
	testDB = database.ConnectTestDB()
	defer func() {
		sqlDB, err := testDB.DB()
		if err == nil {
			sqlDB.Close()
		}
	}()

	// Run tests
	code := m.Run()

	// Exit with the test result code
	os.Exit(code)
}

func SetupRoutes(r *chi.Mux) {
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"}, // Add your frontend URL here
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	routers.SetupRoutes(r)
}
