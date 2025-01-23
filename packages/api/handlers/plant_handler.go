package handlers

import (
	"bytes"
	"io"
	"mime"
	"net/http"
	"path/filepath"

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

	var plant models.Plant
	if err := database.GetDB().First(&plant, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Plant not found"})
		return
	}

	var input models.Plant
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	plant.Name = input.Name
	plant.Species = input.Species
	plant.Description = input.Description
	plant.Location = input.Location
	plant.PurchaseDate = input.PurchaseDate

	if err := database.GetDB().Save(&plant).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update plant"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"plant": plant})
}

// UploadPlantImage は植物の画像をアップロードするハンドラーです
func UploadPlantImage(c *gin.Context) {
	id := c.Param("id")

	// 画像ファイルを取得
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "画像ファイルが見つかりません"})
		return
	}

	// ファイルを開く
	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ファイルの読み込みに失敗しました"})
		return
	}
	defer src.Close()

	// バイナリデータを読み込む
	buf := bytes.NewBuffer(nil)
	if _, err := io.Copy(buf, src); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "データの読み込みに失敗しました"})
		return
	}

	// MIMEタイプを取得
	ext := filepath.Ext(file.Filename)
	mimeType := mime.TypeByExtension(ext)
	if mimeType == "" {
		mimeType = "application/octet-stream"
	}

	// データベースの更新
	var plant models.Plant
	if err := database.GetDB().First(&plant, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "植物が見つかりません"})
		return
	}

	// 画像データを更新
	plant.ImageData = buf.Bytes()
	plant.ImageType = mimeType

	if err := database.GetDB().Save(&plant).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "データベースの更新に失敗しました"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "画像のアップロードが完了しました",
		"plant": gin.H{
			"id":        plant.ID,
			"name":      plant.Name,
			"imageType": plant.ImageType,
		},
	})
}

// GetPlantImage は植物の画像を取得するハンドラーです
func GetPlantImage(c *gin.Context) {
	id := c.Param("id")

	var plant models.Plant
	if err := database.GetDB().First(&plant, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "植物が見つかりません"})
		return
	}

	if plant.ImageData == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "画像が登録されていません"})
		return
	}

	// Content-Typeを設定
	c.Header("Content-Type", plant.ImageType)
	// 画像データを送信
	c.Data(http.StatusOK, plant.ImageType, plant.ImageData)
}
