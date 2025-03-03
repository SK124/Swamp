package models_test

import (
	"swamp/models"
	"testing"
	"time"

	"github.com/glebarez/sqlite" 
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

// setupTestDB
func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	// Migrate the schema
	err = db.AutoMigrate(&models.User{}, &models.Swamp{})
	if err != nil {
		t.Fatalf("Failed to migrate test database: %v", err)
	}

	return db
}

//tests the User model
func TestUserModel(t *testing.T) {
	db := setupTestDB(t)

	defer func() {
		sqlDB, err := db.DB()
		if err == nil {
			sqlDB.Close()
		}
	}()

	t.Run("Create user", func(t *testing.T) {
		user := models.User{
			Username: "TestUser",
		}

		result := db.Create(&user)
		assert.NoError(t, result.Error)
		assert.NotZero(t, user.ID)
		assert.Equal(t, "TestUser", user.Username)
		assert.False(t, user.Deleted)
	})

	t.Run("Retrieve user", func(t *testing.T) {
		// Create a user 
		user := models.User{
			Username: "RetrieveTest",
		}
		db.Create(&user)

		// Retrieve the user
		var retrievedUser models.User
		result := db.First(&retrievedUser, user.ID)
		assert.NoError(t, result.Error)
		assert.Equal(t, user.ID, retrievedUser.ID)
		assert.Equal(t, "RetrieveTest", retrievedUser.Username)
	})

	t.Run("Update user", func(t *testing.T) {
		// Create a user 
		user := models.User{
			Username: "UpdateTest",
		}
		db.Create(&user)

		// Update the user
		db.Model(&user).Update("Username", "UpdatedName")

		var updatedUser models.User
		db.First(&updatedUser, user.ID)
		assert.Equal(t, "UpdatedName", updatedUser.Username)
	})

	t.Run("Delete user", func(t *testing.T) {
		// Create a user first
		user := models.User{
			Username: "DeleteTest",
		}
		db.Create(&user)

		// Delete the user
		db.Delete(&user)

		var deletedUser models.User
		result := db.Unscoped().First(&deletedUser, user.ID)
		assert.NoError(t, result.Error)
		assert.NotNil(t, deletedUser.DeletedAt)
	})
}

//tests the Swamp model
func TestSwampModel(t *testing.T) {
	db := setupTestDB(t)

	t.Run("Create swamp", func(t *testing.T) {
		swamp := models.Swamp{
			Title: "Test Swamp",
			OwnerID:         1,
			MaxParticipants: 5,
			StartTime:       time.Now(),
			Duration:        60,
		}

		result := db.Create(&swamp)
		assert.NoError(t, result.Error)
		assert.NotZero(t, swamp.ID)
		assert.Equal(t, "Test Swamp", swamp.Title)
		assert.Equal(t, 1, swamp.OwnerID)
		assert.Equal(t, 5, swamp.MaxParticipants)
		assert.Equal(t, 60, swamp.Duration)
	})

	t.Run("Retrieve swamp", func(t *testing.T) {
		// Create a swamp first
		swamp := models.Swamp{
			Title:           "Retrieve Test",
			OwnerID:         1,
			MaxParticipants: 10,
			StartTime:       time.Now(),
			Duration:        30,
		}
		db.Create(&swamp)

		// Retrieve the swamp
		var retrievedSwamp models.Swamp
		result := db.First(&retrievedSwamp, swamp.ID)
		assert.NoError(t, result.Error)
		assert.Equal(t, swamp.ID, retrievedSwamp.ID)
		assert.Equal(t, "Retrieve Test", retrievedSwamp.Title)
	})

	t.Run("Update swamp", func(t *testing.T) {
		// Create a swamp first
		swamp := models.Swamp{
			Title:           "Update Test",
			OwnerID:         1,
			MaxParticipants: 8,
			StartTime:       time.Now(),
			Duration:        45,
		}
		db.Create(&swamp)

		// Update the swamp
		db.Model(&swamp).Updates(models.Swamp{
			Title:           "Updated Swamp",
			MaxParticipants: 15,
		})

		// Verify update
		var updatedSwamp models.Swamp
		db.First(&updatedSwamp, swamp.ID)
		assert.Equal(t, "Updated Swamp", updatedSwamp.Title)
		assert.Equal(t, 15, updatedSwamp.MaxParticipants)
	})

	t.Run("Delete swamp", func(t *testing.T) {
		// Create a swamp first
		swamp := models.Swamp{
			Title:           "Delete Test",
			OwnerID:         1,
			MaxParticipants: 6,
			StartTime:       time.Now(),
			Duration:        20,
		}
		db.Create(&swamp)

		// Delete the swamp
		db.Delete(&swamp)

		var deletedSwamp models.Swamp
		result := db.Unscoped().First(&deletedSwamp, swamp.ID)
		assert.NoError(t, result.Error)
		assert.NotNil(t, deletedSwamp.DeletedAt)
	})
}
