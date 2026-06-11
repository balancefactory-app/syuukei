# 売上管理システム — Sales Aggregation App

React + Vite + Tailwind CSS v4 + Firebase Firestore を使った売上集計 Web アプリです。

## 機能

- **売上入力** — 商品名・金額・担当者・支払い方法・備考を登録
- **日次レポート** — 日付別の売上一覧・合計・支払い方法別集計
- **月次レポート** — 月別の日次集計（週末ハイライト付き）
- **商品別レポート** — 期間指定の商品別ランキング（進捗バー付き）

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

## Firestore セキュリティルール（推奨）

本番環境では必ず適切なルールを設定してください。

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 認証済みユーザーのみ読み書き可能
    match /sales/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

開発中（テスト用）：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // 本番では使用しないこと
    }
  }
}
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
