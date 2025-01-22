package database

import (
	"log"

	"github.com/ryusei-semba/leaf-link/packages/api/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	database, err := gorm.Open(sqlite.Open("plants.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Enable foreign key constraints
	database.Exec("PRAGMA foreign_keys = ON")

	// Auto Migrate the schema
	err = database.AutoMigrate(&models.Plant{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	DB = database
}

func GetDB() *gorm.DB {
	return DB
}
