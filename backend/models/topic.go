package models

import "gorm.io/gorm"

type Topic struct {
	gorm.Model
	ID      uint   `gorm:"primaryKey"`
	Name    string `gorm:"uniqueIndex;not null"`
	Deleted bool   `gorm:"default:false"`
}
