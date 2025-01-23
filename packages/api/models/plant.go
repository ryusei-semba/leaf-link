package models

import (
	"time"

	"gorm.io/gorm"
)

type Plant struct {
	ID           uint           `json:"id" gorm:"primarykey"`
	Name         string         `json:"name"`
	Species      string         `json:"species"`
	Description  string         `json:"description"`
	Location     string         `json:"location"`
	PurchaseDate string         `json:"purchaseDate"`
	ImageData    []byte         `json:"imageData,omitempty" gorm:"type:blob"` // 画像のバイナリデータ
	ImageType    string         `json:"imageType,omitempty"`                  // 画像のMIMEタイプ
	CreatedAt    time.Time      `json:"createdAt"`
	UpdatedAt    time.Time      `json:"updatedAt"`
	DeletedAt    gorm.DeletedAt `json:"deletedAt,omitempty" gorm:"index"`
}
