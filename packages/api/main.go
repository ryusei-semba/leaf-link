package main

import (
	"github.com/gin-gonic/gin"
	"github.com/ryusei-semba/leaf-link/packages/api/database"
	"github.com/ryusei-semba/leaf-link/packages/api/handlers"
)

func main() {
	// データベース接続を初期化
	database.Connect()

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

	// APIエンドポイントを設定
	r.GET("/api/plants", handlers.GetPlants)
	r.POST("/api/plants", handlers.CreatePlant)
	r.PUT("/api/plants/:id", handlers.UpdatePlant)
	r.DELETE("/api/plants/:id", handlers.DeletePlant)

	// 画像関連のエンドポイントを追加
	r.POST("/api/plants/:id/image", handlers.UploadPlantImage)
	r.GET("/api/plants/:id/image", handlers.GetPlantImage)

	r.Run(":8080")
}
