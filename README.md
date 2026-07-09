# Therapy English Coach

神奈川県藤沢市片瀬山の古民家サロン **Balance Factory** スタッフ向け、接客英会話ロールプレイ練習アプリ。

Claude Artifacts で作られた単一HTMLの試作品（`therapy-english-coach.html`）を、**画面構成・デザイン・学習フローを維持したまま**、Next.js + TypeScript + Tailwind CSS + Supabase + Claude API で本番運用できる Web アプリとして再構築したものです。

---

## 特長

- 🎭 **19シナリオのロールプレイ** — 受付・問診・施術前後・会計・トラブル対応・医療的な質問への安全な返答など。性格の異なるお客様ペルソナが3ターンの会話をリードします。
- ✨ **AIによる英文採点・添削** — Claude API がスタッフの自由記述英文を「通じやすさ・丁寧さ・安全性・自然さ」の4指標で評価し、改善ポイントと次に覚えるべき1文を日本語で提示します。
- 🛡 **安全な接客英語** — 「治る(cure/heal)」「診断する(diagnose)」等の断定表現を検出し、安全な言い換えを提案します（サロンとしてのリスク回避）。
- 🗂 **フレーズカード（14カテゴリ・約60フレーズ）** — かんたん英語／自然な英語／カナ読み、発音再生（Web Speech API）、★お気に入り保存。
- 📖 **復習リスト** — 保存フレーズと、ロールプレイで指摘された間違いを自動蓄積。「覚えた」で達成管理。
- 👥 **複数スタッフ対応** — Supabase 認証でスタッフごとにアカウントを作成し、進捗を端末間で共有できます。

> 未設定でもすぐ動きます: Supabase 未設定なら `localStorage` のゲストモード、Claude API キー未設定ならキーワードベースの簡易採点に自動フォールバックします。

---

## 技術スタック

| 領域 | 採用技術 |
| --- | --- |
| フレームワーク | Next.js 15（App Router）+ React 19 |
| 言語 | TypeScript |
| スタイル | Tailwind CSS（プロトタイプのパレット/フォントを移植） |
| 状態管理 | Zustand |
| 認証・DB | Supabase（Auth + Postgres + RLS） |
| AI採点 | Anthropic Claude API（`@anthropic-ai/sdk`） |

---

## セットアップ

```bash
# 1. 依存関係のインストール
npm install

# 2. 環境変数の用意（すべて任意。未設定でも動作します）
cp .env.example .env.local
# 必要に応じて .env.local を編集

# 3. 開発サーバー起動
npm run dev
# http://localhost:3000
```

### 環境変数

`.env.local` に設定します（`.env.example` 参照）。

| 変数 | 用途 | 未設定時の挙動 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトURL | ゲストモード（localStorage保存） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon キー | 同上 |
| `ANTHROPIC_API_KEY` | Claude API キー | ルールベースの簡易採点 |
| `ANTHROPIC_MODEL` | 採点モデル（既定 `claude-opus-4-8`） | 既定モデルを使用 |

### Supabase の初期設定

1. [Supabase](https://supabase.com) でプロジェクトを作成。
2. **SQL Editor** で [`supabase/schema.sql`](./supabase/schema.sql) を実行（テーブル + RLS ポリシーを作成）。
3. **Project Settings → API** から `URL` と `anon public` キーを取得し、環境変数に設定。
4. **Authentication → Providers** で Email を有効化（必要に応じてメール確認のON/OFFを設定）。

RLS により、各ユーザーは自分の学習データ（`sessions` / `saved_phrases` / `mistakes`）のみ読み書きできます。

### Claude API（AI採点）

1. [Anthropic Console](https://console.anthropic.com) で API キーを取得。
2. `ANTHROPIC_API_KEY` に設定。
3. 採点は `/api/score`（サーバー側ルート）で実行され、API キーはクライアントに露出しません。

---

## デプロイ（Vercel 想定）

1. リポジトリを Vercel にインポート。
2. 上記の環境変数を Vercel の Project Settings に登録。
3. デプロイ。`middleware.ts` が Supabase 認証セッションを自動更新します。

---

## プロジェクト構成

```
src/
  app/
    layout.tsx            ルートレイアウト（フォント・起動処理）
    page.tsx              ホーム
    scenarios/page.tsx    シナリオ選択
    roleplay/[id]/page.tsx ロールプレイ（チャット）
    results/page.tsx      学習結果（4指標・改善ポイント）
    phrases/page.tsx      フレーズカード
    review/page.tsx       復習リスト
    login/page.tsx        ログイン / 新規登録
    api/score/route.ts    採点API（AI採点 → 失敗時ルールベース）
  components/
    AppFrame.tsx          のれん・トップバー・ボトムナビ（共通シェル）
    AppBootstrap.tsx      起動時の認証・進捗読み込み
  data/
    categories.ts / phrases.ts / scenarios.ts / scoring-constants.ts
  lib/
    types.ts              共通型
    store.ts              Zustand ストア（認証・進捗・ロールプレイ）
    scoring.ts            ルールベース採点（フォールバック）
    anthropic.ts          Claude API 採点（サーバー専用）
    progress.ts           進捗永続化（Supabase / localStorage 切替）
    speak.ts              発音再生（Web Speech API）
    supabase/             Supabase クライアント（browser / server / middleware）
supabase/
  schema.sql              テーブル + RLS 定義
```

### 試作品との対応

- **画面構成**: ホーム / シナリオ / ロールプレイ / 結果 / フレーズ / 復習 の6画面と、のれん・430px 1カラム・ボトムナビをそのまま踏襲。
- **デザイン**: プロトタイプの CSS 変数パレットと Shippori Mincho / Zen Kaku Gothic New フォントを Tailwind に移植。
- **学習フロー**: 3ターンの会話進行、日本語ヒント、的外れな返信への言い換え提示、4指標スコアリング、次に覚えるべき1文、復習への自動蓄積を維持。
- **強化点**: HANDOFF §6 の最優先項目に沿って、採点を Claude API による実添削へ高度化し、複数スタッフのアカウント管理（Supabase）を追加。

---

## スクリプト

```bash
npm run dev        # 開発サーバー
npm run build      # 本番ビルド
npm run start      # 本番サーバー
npm run typecheck  # 型チェック
npm run lint       # ESLint
```
