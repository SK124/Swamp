package models

import (
	"time"
	"gorm.io/gorm"
)

type User struct {
    gorm.Model
    ID             int       `gorm:"primaryKey"`
    Username       string
    CreatedAt      time.Time
    UpdatedAt      time.Time
    Deleted        bool
}
