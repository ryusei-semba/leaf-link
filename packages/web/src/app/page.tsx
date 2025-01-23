'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'

type Plant = {
  id: number
  name: string
  plantName?: string
  species: string
  purchaseDate: string
  location: string
  notes: string
  description?: string
  createdAt: string
  updatedAt: string
  imageType?: string
}

type APIPlant = {
  id: string
  name: string
  description: string
  imageUrl: string
}

const LOCATIONS = [
  { value: 'desk', label: 'デスク' },
  { value: 'balcony', label: 'ベランダ' },
  { value: 'entrance', label: '玄関' },
  { value: 'hallway', label: '廊下' },
  { value: 'kitchen', label: 'キッチン' },
] as const

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

export default function Home() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [apiPlants, setApiPlants] = useState<APIPlant[]>([])
  const [formData, setFormData] = useState({
    plantName: '',
    species: '',
    purchaseDate: formatDate(new Date()),
    location: '',
    notes: ''
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const fetchPlants = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/plants')
      const data = await response.json()
      setPlants(data.plants)
    } catch (err) {
      console.error('Error fetching plants:', err)
    }
  }

  useEffect(() => {
    fetchPlants()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      // プレビュー用のURLを作成
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const uploadImage = async (plantId: number, file: File) => {
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch(`http://localhost:8080/api/plants/${plantId}/image`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('画像のアップロードに失敗しました')
      }

      // アップロード後にプレビューをクリア
      setSelectedImage(null)
      setPreviewUrl(null)
    } catch (err) {
      console.error('Error uploading image:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingId 
        ? `http://localhost:8080/api/plants/${editingId}`
        : 'http://localhost:8080/api/plants'
      
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.plantName,
          species: formData.species,
          description: formData.notes,
          location: formData.location,
          purchaseDate: formData.purchaseDate
        })
      })
      
      if (!response.ok) {
        throw new Error(editingId ? 'Failed to update plant' : 'Failed to create plant')
      }

      const result = await response.json()

      // 画像がある場合はアップロード
      if (selectedImage) {
        await uploadImage(result.plant.id, selectedImage)
      }

      // フォームをリセット
      setFormData({
        plantName: '',
        species: '',
        purchaseDate: formatDate(new Date()),
        location: '',
        notes: ''
      })
      setEditingId(null)
      setSelectedImage(null)
      setPreviewUrl(null)

      // 植物一覧を再取得
      fetchPlants()
    } catch (err) {
      console.error('Error saving plant:', err)
    }
  }

  const handleEdit = (plant: Plant) => {
    setFormData({
      plantName: plant.name,
      species: plant.species || '',
      purchaseDate: plant.purchaseDate || formatDate(new Date()),
      location: plant.location || '',
      notes: plant.description || ''
    })
    setEditingId(plant.id)
  }

  const handleCancel = () => {
    setFormData({
      plantName: '',
      species: '',
      purchaseDate: formatDate(new Date()),
      location: '',
      notes: ''
    })
    setEditingId(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/plants/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete plant')
      }

      // 植物一覧を再取得
      fetchPlants()
    } catch (err) {
      console.error('Error deleting plant:', err)
    }
  }

  const getLocationLabel = (value: string) => {
    return LOCATIONS.find(loc => loc.value === value)?.label || value
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">観葉植物管理システム</h1>
        
        {/* Large Top Left Leaf */}
        <div className="fixed -top-32 -left-32 w-[500px] h-[500px] text-green-200 pointer-events-none">
          <svg className="w-full h-full transform rotate-45 leaf-wave" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 8C17 8 17.5 14 12 19.5C6.5 14 7 8 7 8C7 8 7 3 12 3C17 3 17 8 17 8Z"/>
          </svg>
        </div>

        {/* Large Bottom Right Leaf */}
        <div className="fixed -bottom-24 -right-24 w-[400px] h-[400px] text-emerald-200 pointer-events-none">
          <svg className="w-full h-full transform -rotate-12 leaf-wave" viewBox="0 0 24 24" fill="currentColor" style={{ animationDelay: '0.5s' }}>
            <path d="M12 2C15 2 17 4 17 8C17 12 12 19.5 12 19.5C12 19.5 7 12 7 8C7 4 9 2 12 2Z"/>
          </svg>
        </div>

        {/* Additional Decorative Leaves */}
        <div className="fixed -top-16 -right-16 w-48 h-48 text-green-200 pointer-events-none">
          <svg className="w-full h-full transform rotate-90 leaf-wave" viewBox="0 0 24 24" fill="currentColor" style={{ animationDelay: '1s' }}>
            <path d="M12 3C15 3 17 5 17 8C17 11 12 17 12 17C12 17 7 11 7 8C7 5 9 3 12 3Z"/>
          </svg>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            {editingId ? '植物データの編集' : '新規植物登録'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="plantName" className="block text-sm font-medium text-gray-700 mb-2">
                  植物の名前
                </label>
                <input
                  type="text"
                  id="plantName"
                  name="plantName"
                  value={formData.plantName}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="モンステラ"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-2">
                  品種
                </label>
                <input
                  type="text"
                  id="species"
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="デリシオサ"
                />
              </div>

              <div>
                <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-2">
                  購入日
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="purchaseDate"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  設置場所
                </label>
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">設置場所を選択</option>
                  {LOCATIONS.map(loc => (
                    <option key={loc.value} value={loc.value}>
                      {loc.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                メモ
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="水やりの頻度や特記事項など"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                画像
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  画像を選択
                </label>
                {previewUrl && (
                  <div className="relative w-24 h-24">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                >
                  キャンセル
                </button>
              )}
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
              >
                {editingId ? '更新する' : '登録する'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">登録済み植物一覧</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">画像</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">植物名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">品種</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">購入日</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">設置場所</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      登録された植物はありません
                    </td>
                  </tr>
                ) : (
                  plants.map(plant => (
                    <tr key={plant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative w-16 h-16">
                          {plant.imageType ? (
                            <Image
                              src={`http://localhost:8080/api/plants/${plant.id}/image`}
                              alt={plant.name}
                              fill
                              className="object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{plant.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{plant.species}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{plant.purchaseDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{getLocationLabel(plant.location)}</td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-4">
                        <button
                          onClick={() => handleEdit(plant)}
                          className="text-blue-600 hover:text-blue-900 focus:outline-none"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(plant.id)}
                          className="text-red-600 hover:text-red-900 focus:outline-none"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
