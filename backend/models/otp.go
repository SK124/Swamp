package models

import (
	"time"

	"gorm.io/gorm"
)

// OTP model for storing OTP codes
type OTP struct {
	ID        uint      `gorm:"primaryKey"`
	Email     string    `gorm:"uniqueIndex;not null"`
	Code      string    `gorm:"not null"`
	ExpiresAt time.Time `gorm:"not null"`
	CreatedAt time.Time
}

// BeforeCreate sets the expiration time for OTP
func (otp *OTP) BeforeCreate(tx *gorm.DB) (err error) {
	otp.ExpiresAt = time.Now().Add(5 * time.Minute) // OTP expires in 5 minutes
	return nil
}
