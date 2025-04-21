package models

// SwampTopic is the join table between Swamps and Topics
// It records which topics are associated with which swamp.
// Composite primary key ensures uniqueness.

type SwampTopic struct {
    SwampID uint `gorm:"primaryKey" json:"SwampID"`
    TopicID uint `gorm:"primaryKey" json:"TopicID"`
}