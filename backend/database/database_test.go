package database_test

import (
	"swamp/models"
	"testing"

	"github.com/glebarez/sqlite"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

// TestConnectDB tests the database connection functionality
func TestConnectDB(t *testing.T) {
	t.Run("Database connection should succeed with test database", func(t *testing.T) {
		// Testing using an in-memory SQLite database for testing
		db, err := setupTestDB(t)
		if err != nil {
			t.Fatalf("Failed to connect to test database: %v", err)
		}
		defer func() {
			sqlDB, err := db.DB()
			if err == nil {
				sqlDB.Close()
			}
		}()

		assert.NotNil(t, db)

		// Check if connection is valid
		sqlDB, err := db.DB()
		assert.NoError(t, err)
		assert.NoError(t, sqlDB.Ping())

		// Create a test user
		user := models.User{
			Username: "TestUser",
		}

		result := db.Create(&user)
		assert.NoError(t, result.Error)
		assert.NotZero(t, user.ID)

		// Test data can be read
		var retrievedUser models.User
		result = db.First(&retrievedUser, user.ID)
		assert.NoError(t, result.Error)
		assert.Equal(t, "TestUser", retrievedUser.Username)
	})
}

// setupTestDB creates an in-memory database for testing
func setupTestDB(t *testing.T) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Migrate the schema
	err = db.AutoMigrate(&models.User{}, &models.Swamp{})
	if err != nil {
		return nil, err
	}

	return db, nil
}

// TestMockDB provides a mock database for other tests
// func TestMockDB(t *testing.T) (*gorm.DB, error) {
// 	// This function can be used by other test files to get a mock database
// 	return setupTestDB(t)
// }
