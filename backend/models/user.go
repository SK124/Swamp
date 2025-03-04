package models

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	FullName string `json:"full_name"`
	Email    string `json:"email" gorm:"uniqueIndex"`
	Password string `json:"-"` // Password is not exposed in JSON responses
}
