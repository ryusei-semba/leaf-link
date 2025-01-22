package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Plant struct {
	ID           string    `json:"id"`
	PlantName    string    `json:"plantName"`
	Species      string    `json:"species"`
	PurchaseDate string    `json:"purchaseDate"`
	Location     string    `json:"location"`
	Notes        string    `json:"notes"`
	CreatedAt    time.Time `json:"createdAt"`
}

var samplePlants = []Plant{
	{
		ID:           "1",
		PlantName:    "サンプルモンステラ",
		Species:      "モンステラ・デリシオサ",
		PurchaseDate: "2024-01-15",
		Location:     "desk",
		Notes:        "週1回の水やりが必要です",
		CreatedAt:    time.Now(),
	},
	{
		ID:           "2",
		PlantName:    "サンプルパキラ",
		Species:      "パキラ・アクアティカ",
		PurchaseDate: "2024-01-10",
		Location:     "entrance",
		Notes:        "明るい場所で管理しています",
		CreatedAt:    time.Now(),
	},
}

func main() {
	r := gin.Default()

	// CORSの設定
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept"}
	r.Use(cors.New(config))

	// ルーティング
	api := r.Group("/api")
	{
		plants := api.Group("/plants")
		{
			plants.GET("", listPlants)
			plants.POST("", createPlant)
			plants.GET("/:id", getPlant)
			plants.PUT("/:id", updatePlant)
			plants.DELETE("/:id", deletePlant)
		}
	}

	log.Printf("Server running on http://localhost:8080")
	log.Fatal(r.Run(":8080"))
}

func listPlants(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"plants": samplePlants,
	})
}

func createPlant(c *gin.Context) {
	var newPlant Plant
	if err := c.ShouldBindJSON(&newPlant); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newPlant.ID = "3" // 実際のアプリケーションではUUIDなどを使用
	newPlant.CreatedAt = time.Now()
	samplePlants = append(samplePlants, newPlant)

	c.JSON(http.StatusCreated, newPlant)
}

func getPlant(c *gin.Context) {
	id := c.Param("id")
	for _, plant := range samplePlants {
		if plant.ID == id {
			c.JSON(http.StatusOK, plant)
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "Plant not found"})
}

func updatePlant(c *gin.Context) {
	id := c.Param("id")
	var updatedPlant Plant
	if err := c.ShouldBindJSON(&updatedPlant); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for i, plant := range samplePlants {
		if plant.ID == id {
			updatedPlant.ID = id
			updatedPlant.CreatedAt = plant.CreatedAt
			samplePlants[i] = updatedPlant
			c.JSON(http.StatusOK, updatedPlant)
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "Plant not found"})
}

func deletePlant(c *gin.Context) {
	id := c.Param("id")
	for i, plant := range samplePlants {
		if plant.ID == id {
			samplePlants = append(samplePlants[:i], samplePlants[i+1:]...)
			c.JSON(http.StatusOK, gin.H{"message": "Plant deleted successfully"})
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "Plant not found"})
}
