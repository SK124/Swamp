package models

// UserTopic is the join table for user preferences
type UserTopic struct {
  UserID  uint `gorm:"primaryKey"`
  TopicID uint `gorm:"primaryKey"`
}