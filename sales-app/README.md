# 売上管理システム — Sales Aggregation App

React + Vite + Tailwind CSS v4 + Firebase Firestore を使った売上集計 Web アプリです。

## 機能

- **売上入力** — 商品名・金額・担当者・支払い方法・備考を登録
- **日次レポート** — 日付別の売上一覧・合計・支払い方法別集計
- **月次レポート** — 月別の日次集計（週末ハイライト付き）
- **商品別レポート** — 期間指定の商品別ランキング（進捗バー付き）
- **顧客・商品管理** — 顧客名・商品名の追加・編集・削除、顧客名のCSVインポート/エクスポート
- **簡易パスワードログイン** — 端末ごとに一度ログインすれば再ログイン不要

## Firebase セットアップ

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. **Firestore Database** を作成（最初はテストモードでOK）
3. **Project Settings** > **General** > **Your apps** から Web アプリを追加
4. 表示された `firebaseConfig` を `src/firebase.js` に貼り付け

```js
// src/firebase.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 開発サーバーの起動

```bash
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

## ビルド

```bash
npm run build
npm run preview
```

## ログイン（簡易パスワード制）

スタッフ全員で共有する1つのパスワードでログインします。ログイン後は Firebase Authentication の匿名認証でその端末にセッションが保存されるため、**同じ端末・同じブラウザであれば次回以降パスワード入力は不要**です（ブラウザのデータを消去した場合は再入力が必要）。

1. プロジェクトルートに `.env` ファイルを作成（`.env.example` を参考に）

```
VITE_APP_PASSWORD=好きなパスワード
```

2. Firebase Console で **Authentication** > **Sign-in method** > **匿名（Anonymous）** を有効化

3. `npm run build` 時にパスワードがビルドに埋め込まれます。パスワードを変更する場合は `.env` を編集して再ビルド・再デプロイしてください。

## Firestore セキュリティルール

このリポジトリの `firestore.rules` は「ログイン済みユーザーのみ読み書き可」になっています。Firebase CLI でデプロイしてください（後述）。

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Firebase Hosting への本番デプロイ

1. Firebase CLI をインストール（初回のみ）

```bash
npm install -g firebase-tools
firebase login
```

2. `.env` にパスワードを設定した状態でビルド

```bash
npm run build
```

3. Firestoreルールとホスティングをデプロイ

```bash
firebase deploy
```

4. 表示された `https://syuukei-app.web.app` のようなURLをスタッフに共有してください。

### スマホ・タブレットでアプリ化（ホーム画面に追加）

URLをブラウザで開いた状態のまま、各端末で以下の操作をすると、ホーム画面にアイコンが追加され、アプリのように起動できます（実際のアプリストアへの登録は不要です）。

**iPhone/iPad（Safari）**
1. 共有されたURLをSafariで開く
2. 共有ボタン（□から↑が出ているアイコン）をタップ
3. 「ホーム画面に追加」を選択

**Android（Chrome）**
1. 共有されたURLをChromeで開く
2. 右上の「⋮」メニューをタップ
3. 「ホーム画面に追加」または「アプリをインストール」を選択

ログインは端末ごとに一度だけ必要です（共有パスワードを入力）。一度ログインすれば、ホーム画面のアイコンから次回以降パスワード入力なしで開けます。

### 更新時の再デプロイ

コードを変更した場合は、ビルドしてから再度デプロイします。

```bash
npm run build
firebase deploy
```

## Firestore コンポジットインデックス

`createdAt` フィールドを使った `where` + `orderBy` クエリのため、初回アクセス時にコンソールにインデックス作成リンクが表示されます。リンクをクリックするだけで自動作成できます。

コレクション `sales` に必要なインデックス：
- `createdAt` (Ascending)

## 技術スタック

| 技術 | バージョン |
|------|-----------|
| React | 19 |
| Vite | 8 |
| Tailwind CSS | 4 (via @tailwindcss/vite) |
| Firebase | 12 |
| @headlessui/react | 2 |
