package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ryusei-semba/leaf-link/packages/api/database"
	"github.com/ryusei-semba/leaf-link/packages/api/models"
)

func GetPlants(c *gin.Context) {
	var plants []models.Plant
	result := database.GetDB().Find(&plants)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch plants"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"plants": plants})
}

func CreatePlant(c *gin.Context) {
	var plant models.Plant
	if err := c.ShouldBindJSON(&plant); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := database.GetDB().Create(&plant)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create plant"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"plant": plant})
}

func DeletePlant(c *gin.Context) {
	id := c.Param("id")
	result := database.GetDB().Delete(&models.Plant{}, id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete plant"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Plant not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Plant deleted successfully"})
}

func UpdatePlant(c *gin.Context) {
	id := c.Param("id")

	// 既存のプラントを取得
	var plant models.Plant
	if err := database.GetDB().First(&plant, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Plant not found"})
		return
	}

	// リクエストボディをバインド
	var input models.Plant
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 更新するフィールドを設定
	plant.Name = input.Name
	plant.Species = input.Species
	plant.Description = input.Description
	plant.Location = input.Location
	plant.Notes = input.Notes
	plant.PurchaseDate = input.PurchaseDate

	// データベースを更新
	if err := database.GetDB().Save(&plant).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update plant"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"plant": plant})
}
