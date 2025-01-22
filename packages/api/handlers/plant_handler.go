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
