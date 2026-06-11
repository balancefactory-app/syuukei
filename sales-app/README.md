# 売上管理アプリ

React + Vite + Tailwind CSS + Firebase Firestore を使った売上集計アプリです。

## Firebase セットアップ

1. [Firebase Console](https://console.firebase.google.com/) にアクセスしてプロジェクトを作成
2. Firestore Database を作成（テストモードで開始して後でルールを設定）
3. Project Settings > General > Your apps から Web アプリを追加
4. 表示された `firebaseConfig` の値を `src/firebase.js` に貼り付け

```js
const firebaseConfig = {
  apiKey: "実際のAPIキー",
  authDomain: "プロジェクトID.firebaseapp.com",
  projectId: "実際のプロジェクトID",
  storageBucket: "プロジェクトID.appspot.com",
  messagingSenderId: "メッセージングセンダーID",
  appId: "アプリID"
};
```

5. Firestore のセキュリティルールを設定（本番前に必ず設定）

## Firestore インデックス設定

以下のコンポジットインデックスが必要です。初回アクセス時にコンソールにリンクが表示されます。

コレクション: `sales`
- `createdAt` (Ascending) + `createdAt` (Descending) — 単一フィールドで自動作成されます
- `createdAt` のインデックスが必要なクエリ: where + orderBy の組み合わせ

コンソールに表示されるリンクをクリックするだけで自動作成できます。

## 開発環境の起動

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

## スタッフリストのカスタマイズ

`src/components/SalesForm.jsx` の `STAFF_LIST` 配列を編集してください。

```js
const STAFF_LIST = ['田中', '鈴木', '佐藤', 'その他']
```
