package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Plant struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	ImageURL    string `json:"imageUrl"`
}

func main() {
	r := gin.Default()

	// CORSミドルウェアを追加
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// サンプルデータを返すエンドポイント
	r.GET("/api/plants", func(c *gin.Context) {
		plants := []Plant{
			{
				ID:          "1",
				Name:        "モンステラ",
				Description: "大きな葉が特徴的な観葉植物です。",
				ImageURL:    "https://example.com/monstera.jpg",
			},
			{
				ID:          "2",
				Name:        "サンスベリア",
				Description: "丈夫で育てやすい観葉植物です。",
				ImageURL:    "https://example.com/sansevieria.jpg",
			},
			{
				ID:          "3",
				Name:        "パキラ",
				Description: "幹が編み込まれた観葉植物です。",
				ImageURL:    "https://example.com/pachira.jpg",
			},
		}

		c.JSON(http.StatusOK, gin.H{
			"plants": plants,
		})
	})

	r.Run(":8080")
}
