package models

import (
	"time"

	"gorm.io/gorm"
)

type Plant struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	Name         string         `json:"name" gorm:"not null"`
	Species      string         `json:"species"`
	Description  string         `json:"description"`
	Location     string         `json:"location"`
	Notes        string         `json:"notes"`
	PurchaseDate string         `json:"purchaseDate"`
	ImageURL     string         `json:"imageUrl"`
	CreatedAt    time.Time      `json:"createdAt"`
	UpdatedAt    time.Time      `json:"updatedAt"`
	DeletedAt    gorm.DeletedAt `json:"deletedAt,omitempty" gorm:"index"`
}
