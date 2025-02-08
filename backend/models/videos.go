package models

import (
	"time"
	"gorm.io/gorm"
)

type Swamp struct {
    gorm.Model
    ID             int       `gorm:"primaryKey"`
    Title          string
    Topics        []int      `gorm:"type:integer[]"`
    OwnerID        int
    MaxParticipants int
    StartTime      time.Time
    Duration       int
    CreatedAt      time.Time
    UpdatedAt      time.Time
    Deleted        bool
}
