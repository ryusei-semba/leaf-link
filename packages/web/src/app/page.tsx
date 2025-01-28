'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'

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
  const { theme, setTheme } = useTheme()
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
    <main className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary">観葉植物管理システム</h1>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-3 rounded-full bg-card-background border border-card-border shadow-lg hover:bg-card-hover transition-colors duration-200"
            aria-label="テーマの切り替え"
          >
            {theme === 'dark' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                />
              </svg>
            )}
          </button>
        </div>
        
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

        <div className="bg-card-background rounded-lg shadow-lg p-6 mb-8 border border-card-border">
          <h2 className="text-2xl font-semibold mb-6 text-text-primary">
            {editingId ? '植物データの編集' : '新規植物登録'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="plantName" className="block text-sm font-medium text-text-secondary mb-2">
                  植物の名前
                </label>
                <input
                  type="text"
                  id="plantName"
                  name="plantName"
                  value={formData.plantName}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="モンステラ"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="species" className="block text-sm font-medium text-text-secondary mb-2">
                  品種
                </label>
                <input
                  type="text"
                  id="species"
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="デリシオサ"
                />
              </div>

              <div>
                <label htmlFor="purchaseDate" className="block text-sm font-medium text-text-secondary mb-2">
                  購入日
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="purchaseDate"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    className="input-field w-full"
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-text-secondary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-text-secondary mb-2">
                  設置場所
                </label>
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input-field w-full"
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
              <label htmlFor="notes" className="block text-sm font-medium text-text-secondary mb-2">
                メモ
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="input-field w-full"
                placeholder="水やりの頻度や特記事項など"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-2">
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
                  className="cursor-pointer bg-card-background text-text-primary px-4 py-2 border border-card-border rounded-md shadow-sm text-sm font-medium hover:bg-card-hover focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200"
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
                  className="bg-card-background text-text-primary px-6 py-2 rounded-md border border-card-border hover:bg-card-hover focus:outline-none focus:ring-2 focus:ring-accent transition-colors duration-200"
                >
                  キャンセル
                </button>
              )}
              <button
                type="submit"
                className="btn-primary"
              >
                {editingId ? '更新する' : '登録する'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-card-background rounded-lg shadow-lg p-6 border border-card-border">
          <h2 className="text-2xl font-semibold mb-6 text-text-primary">登録済み植物一覧</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-card-border">
              <thead className="bg-card-hover">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">画像</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">植物名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">品種</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">購入日</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">設置場所</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {plants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-text-secondary">
                      登録された植物はありません
                    </td>
                  </tr>
                ) : (
                  plants.map(plant => (
                    <tr key={plant.id} className="hover:bg-card-hover">
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
                            <div className="w-16 h-16 bg-card-hover rounded-md flex items-center justify-center">
                              <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-primary">{plant.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-primary">{plant.species}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-primary">{plant.purchaseDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-primary">{getLocationLabel(plant.location)}</td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-4">
                        <button
                          onClick={() => handleEdit(plant)}
                          className="text-accent hover:text-accent-hover focus:outline-none"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(plant.id)}
                          className="text-red-500 hover:text-red-700 focus:outline-none"
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
