# 家計簿アプリ REST API 設計書

## 1. 概要

本 API は、家計簿アプリにおける収入・支出・カテゴリ管理および集計情報を提供する
RESTful API である。

- API Version: v1
- Base URL: `/api/v1`
- データ形式: JSON
- 認証方式: Bearer Token（JWT想定）

---

## 2. 共通仕様

### 2.1 リクエスト共通

- Content-Type: `application/json`
- Accept: `application/json`
- Authorization: `Bearer <token>`

### 2.2 日付・数値ルール

- 日付: ISO 8601 (`YYYY-MM-DD`)
- 通貨: ISO 4217（例: JPY）
- 金額:
  - 収入: 正数
  - 支出: 負数
  - 0 は不可

### 2.3 エラーレスポンス共通形式

```json
{
  "error": {
    "code": "INVALID_PARAMS",
    "message": "パラメータが不正です",
    "details": [
      "amount must not be zero"
    ]
  }
}

### 3. リソース一覧

| リソース名   | 説明               |
| ------------  | ------------------ |
| users         | 認証ユーザー      |
| categories    | 取引カテゴ        |
| transactions  | 収入・支出        |
| summaries     | 集計


### 4. Users

#### 4.1 エンドポイント一覧
| メソッド | パス      | 説明                    |
| --------- | --------- | ----------------------- |
| GET       | /users/me | 自分のユーザー情報取得 |
| PATCH     | /users/me | 自分のユーザー情報更新 |

#### 4.2 GET /users/me

#### レスポンス（200）
{
  "id": "user_001",
  "name": "Taro",
  "currency": "JPY",
  "createdAt": "2026-01-01T00:00:00Z"
}

### 5. Categories
#### 5.1 エンドポイント一覧
| メソッド  | パス     ------- | 説明                   |
| --------- | ---------------- | ----------------------- |
| GET       | /categories      | カテゴリ一覧           |
| POST      | /categories      | カテゴリ作成           |
| PATCH     | /categories/{id} | カテゴリ更新           |
| DELETE    | /categories/{id} | カテゴリ削除           |

#### 5.2 Category モデル
| フィールド | 型      | 必須 | 制約             |
| ----------- | ------ | ----- | ---------------- |
| id          | string | ○    | UUID             |
| name        | string | ○    | 1〜50文字        |
| type        | string | ○    | income / expense |
| createdAt   | string | ○    | ISO datetime     |

#### 5.3 POST /categories
{
  "name": "食費",
  "type": "expense"
}

#### レスポンス
- 201 Created
- 400 INVALID_PARAMS

### 6. Transactions
#### 6.1 エンドポイント一覧
| メソッド  | パス               | 説明    |
| -------   | ------------------ | -------- |
| GET       | /transactions      | 取引一覧 |
| POST      | /transactions      | 取引作成 |
| GET       | /transactions/{id} | 取引取得 |
| PATCH     | /transactions/{id} | 取引更新 |
| DELETE    | /transactions/{id} | 取引削除 |

#### 6.2 Transaction モデル
| フィールド  | 型    | 必須 | 制約          |
| ----------- | ------ |----- | ------------- |
| id          | string | ○   | UUID          |
| date        | string | ○   | YYYY-MM-DD    |
| amount      | number | ○   | 0不可         |
| categoryId  | string | ○   | categories.id |
| memo        | string | ×   | 最大255文字   |
| currency    | string | ○   | ISO 4217      |
| createdAt   | string | ○   | ISO datetime  |
| updatedAt   | string | ○   | ISO datetime  |

#### 6.3 GET /transactions
| 名前       | 型     | 必須 | 説明               |
| ---------- | ------ | ---- | ------------------- |
| from       | string | ×   | 開始日              |
| to         | string | ×   | 終了日              |
| categoryId | string | ×   | カテゴリ            |
| page       | number | ×   | default=1           |
| limit      | number | ×   | default=20, max=100 |

#### レスポンス（200）
{
  "data": [
    {
      "id": "tx_001",
      "date": "2026-02-01",
      "amount": -1200,
      "categoryId": "cat_food",
      "memo": "昼食",
      "currency": "JPY"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
``

#### 6.4 POST /transactions
#### リクエスト
{
  "date": "2026-02-01",
  "amount": -1200,
  "categoryId": "cat_food",
  "memo": "昼食",
  "currency": "JPY"
}

#### バリデーション
- amount != 0
- 400 INVALID_PARAMS
- 404 CATEGORY_NOT_FOUND

#### 6.5 PATCH /transactions/{id}
#### 更新可能項目
- date
- amount
- category Id
- memo

### 7. Summaries
#### 7.1 エンドポイント一覧
| メソッド | パス                   | 説明           |
| -------- | ---------------------- | --------------- |
| GET      | /summaries/monthly     | 月次集計       |
| GET      | /summaries/by-category | カテゴリ別集計 |

#### 7.2 GET /summaries/monthly
#### クエリ
| 名前  | 型     | 必須 |
| ----  | ------ | ----- |
| year  | number | ○    |
| month | number | ○    |

#### レスポンス
{
  "year": 2026,
  "month": 2,
  "income": 200000,
  "expense": 120000,
  "balance": 80000
}

### 8. HTTP ステータスコード
| コード | 用途           |
| ------ | -------------- |
| 200    | 成功           |
| 201    | 作成成功       |
| 204    | 削除成功       |
| 400    | 入力エラー     |
| 401    | 認証失敗       |
| 404    | リソース未存在 |
| 500    | サーバーエラー |

### 9. 実装メモ（非機能）
- transactions / categories は userId で必ずスコープされる
- DELETE は論理削除を想定しても良い
- 集計は transactions テーブルを集約

```
