# LeafLink - 植物管理アプリケーション

LeafLinkは、観葉植物の管理をサポートするWebアプリケーションです。植物の基本情報、画像、育成記録などを簡単に管理できます。

## 技術スタック

### バックエンド
- Go 1.23.5
- Gin (Webフレームワーク)
- GORM (ORM)
- SQLite (データベース)

### フロントエンド
- Next.js 14
- TypeScript
- Tailwind CSS

## セットアップ

### 必要条件
- Go 1.23.5以上
- Node.js 18以上
- yarn

### インストール手順

1. リポジトリのクローン
```bash
git clone https://github.com/ryusei-semba/leaf-link.git
cd leaf-link
```

2. バックエンドのセットアップ
```bash
cd packages/api
go mod download
go run main.go
```

3. フロントエンドのセットアップ
```bash
cd packages/web
yarn install
yarn dev
```

## 機能一覧

### 植物管理機能
- 植物の登録
  - 名前、種類、説明、設置場所、購入日の記録
  - 画像のアップロードと表示
- 植物情報の編集
- 植物の削除
- 植物一覧の表示

### API エンドポイント
- GET /api/plants - 植物一覧の取得
- POST /api/plants - 新規植物の登録
- PUT /api/plants/:id - 植物情報の更新
- DELETE /api/plants/:id - 植物の削除
- POST /api/plants/:id/image - 植物画像のアップロード
- GET /api/plants/:id/image - 植物画像の取得

## 開発環境

- バックエンドサーバー: http://localhost:8080
- フロントエンドサーバー: http://localhost:3000

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
