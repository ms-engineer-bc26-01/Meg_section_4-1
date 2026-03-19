# 家計簿 API 設計書

## 概要

家計簿アプリのバックエンド API です。
収入・支出の記録を管理する REST API を提供します。

- ベース URL: `http://localhost:3001`
- データ形式: JSON
- 文字コード: UTF-8

---

## リソース

### Transaction（入出金記録）

| フィールド    | 型       | 説明                            | 制約                         |
| ----------- | -------- | ------------------------------- | ---------------------------- |
| `id`        | number   | 自動採番 ID                      | 読み取り専用                  |
| `date`      | string   | 日付（YYYY-MM-DD 形式）           | 必須、YYYY-MM-DD              |
| `type`      | string   | 種別                             | 必須、`income` または `expense` |
| `category`  | string   | カテゴリ                          | 必須、1〜50文字               |
| `description`| string  | 説明                             | 必須、1〜200文字              |
| `amount`    | number   | 金額（円）                        | 必須、1以上の整数             |
| `createdAt` | string   | 作成日時（ISO 8601）              | 読み取り専用                  |
| `updatedAt` | string   | 更新日時（ISO 8601）              | 読み取り専用                  |

---

## エンドポイント一覧

| Method   | Path                        | 説明                  |
| -------- | --------------------------- | --------------------- |
| `GET`    | `/api/transactions`         | 入出金一覧取得（月別） |
| `POST`   | `/api/transactions`         | 入出金の新規作成      |
| `GET`    | `/api/transactions/:id`     | 入出金の詳細取得      |
| `PUT`    | `/api/transactions/:id`     | 入出金の更新          |
| `DELETE` | `/api/transactions/:id`     | 入出金の削除          |
| `GET`    | `/health`                   | ヘルスチェック        |

---

## エンドポイント詳細

### GET /api/transactions

入出金の一覧を取得します。`month` クエリパラメータで月別フィルタリングが可能です。

**クエリパラメータ**

| パラメータ | 型     | 必須 | 説明                       | 例         |
| --------- | ------ | ---- | -------------------------- | ---------- |
| `month`   | string | 任意 | フィルター月（YYYY-MM形式） | `2026-03`  |

**レスポンス例（200 OK）**

```json
[
  {
    "id": 1,
    "date": "2026-03-01",
    "type": "income",
    "category": "給与",
    "description": "3月分給与",
    "amount": 280000,
    "createdAt": "2026-03-01T00:00:00.000Z",
    "updatedAt": "2026-03-01T00:00:00.000Z"
  }
]
```

---

### POST /api/transactions

入出金を新規作成します。

**リクエストボディ**

```json
{
  "date": "2026-03-18",
  "type": "expense",
  "category": "食費",
  "description": "ランチ代",
  "amount": 1200
}
```

**レスポンス例（201 Created）**

```json
{
  "id": 19,
  "date": "2026-03-18",
  "type": "expense",
  "category": "食費",
  "description": "ランチ代",
  "amount": 1200,
  "createdAt": "2026-03-18T12:00:00.000Z",
  "updatedAt": "2026-03-18T12:00:00.000Z"
}
```

---

### GET /api/transactions/:id

指定した ID の入出金を取得します。

**パスパラメータ**

| パラメータ | 型     | 説明 |
| --------- | ------ | ---- |
| `id`      | number | ID   |

**レスポンス例（200 OK）**

```json
{
  "id": 1,
  "date": "2026-03-01",
  "type": "income",
  "category": "給与",
  "description": "3月分給与",
  "amount": 280000,
  "createdAt": "2026-03-01T00:00:00.000Z",
  "updatedAt": "2026-03-01T00:00:00.000Z"
}
```

---

### PUT /api/transactions/:id

指定した ID の入出金を更新します。全フィールドの指定が必要です（完全置換）。

**リクエストボディ**

```json
{
  "date": "2026-03-18",
  "type": "expense",
  "category": "外食費",
  "description": "ランチ代（更新）",
  "amount": 1500
}
```

**レスポンス例（200 OK）**

```json
{
  "id": 19,
  "date": "2026-03-18",
  "type": "expense",
  "category": "外食費",
  "description": "ランチ代（更新）",
  "amount": 1500,
  "createdAt": "2026-03-18T12:00:00.000Z",
  "updatedAt": "2026-03-18T13:00:00.000Z"
}
```

---

### DELETE /api/transactions/:id

指定した ID の入出金を削除します。

**レスポンス例（200 OK）**

```json
{
  "message": "削除しました"
}
```

---

### GET /health

サーバーのヘルスチェック。

**レスポンス例（200 OK）**

```json
{
  "status": "ok"
}
```

---

## エラーレスポンス

### 400 バリデーションエラー

リクエストデータが不正な場合に返します。

```json
{
  "error": "バリデーションエラー",
  "details": [
    { "field": "amount", "message": "金額は1以上の整数で入力してください" },
    { "field": "type", "message": "typeはincomeまたはexpenseです" }
  ]
}
```

### 404 Not Found

指定した ID のリソースが存在しない場合に返します。

```json
{
  "error": "見つかりません"
}
```

### 500 Internal Server Error

予期せぬサーバーエラーが発生した場合に返します。

```json
{
  "error": "サーバーエラーが発生しました"
}
```

---

## ログ・デバッグ設定

環境変数 `LOG_LEVEL` でログの出力レベルを制御します。

| LOG_LEVEL | 出力されるログ                              |
| --------- | ------------------------------------------ |
| `error`   | エラーログのみ                              |
| `warn`    | エラー + 警告                               |
| `info`    | エラー + 警告 + 操作ログ（デフォルト）       |
| `http`    | 上記 + アクセスログ（Morgan）               |
| `debug`   | 上記 + デバッグログ（リクエスト詳細等）      |

Node.js デバッガは `--inspect=0.0.0.0:9229` で起動し、ポート `9229` で接続します。
