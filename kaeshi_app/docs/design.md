# 基本設計書: かえし等原価・納品管理Webアプリ（v2）

## 1. システム・アーキテクチャ
本システムは、高い保守性と拡張性を持つ最新のWebアプリケーション構成を採用します。

- **フロントエンド**: React (Vite環境 + TypeScript)
  - **スタイリング**: Vanilla CSSを使用。ダークモード＆グラスモーフィズムのリッチUI。
- **バックエンド**: Python (FastAPI)
  - レシピの再帰的原価計算エンジン、納品・請求書API等を提供する。
- **データベース**: SQLite (SQLAlchemy ORM)
  - 要件定義で作成したER図に基づき、リレーショナルデータとして厳密に管理。

---

## 2. データモデル詳細設計（v2 変更点）

### 2.1. 変更概要
前回のv1設計から、ユースケースへのフィードバックを受けて以下の変更を行う。

| テーブル | 変更内容 |
|---------|---------|
| `ingredients` | `unit_price` を廃止し `price`（購入金額）と `quantity`（仕入量）を追加。`unit_price` は `price/quantity` で自動計算。 |
| `recipes` | `delivery_unit_amount`/`delivery_unit_type` を廃止。`delivery_batches`（何回作成分か）、`batch_yield`（1回の出来上がり量）、`bowl_amount`/`bowl_unit`（一杯量）に変更。 |
| `recipe_items` | `amount_per_bowl` を削除（一杯量はレシピレベルに移動）。`quantity` は「1回作るときの使用量」に変更。 |
| `deliveries` | `delivery_number`（納品番号）を追加。**システムが `YYYYMMDD-NNN` 形式で自動付与**。 |
| `invoices` | `billing_month` を削除し、`target_start_date` / `target_end_date`（納入期間）に変更。 |

### 2.2. テーブル定義

#### `ingredients`（原材料マスター）
| カラム | 型 | 説明 |
|--------|-----|------|
| id | INTEGER PK | 自動採番 |
| name | TEXT NOT NULL | 材料名 |
| price | REAL | 購入金額（総額） **【新規】** |
| quantity | REAL | 仕入量 **【新規】** |
| unit_type | TEXT | 仕入単位（g, L 等） |
| unit_price | REAL | 単価（= price ÷ quantity、システム自動計算） |

> **変更ポイント**: 旧 `unit_price`（直接入力）を廃止。ユーザーが「購入金額」と「仕入量」を入力し、`unit_price` はシステムが `price / quantity` で自動計算する。

#### `recipes`（レシピ・品名マスター）
| カラム | 型 | 説明 |
|--------|-----|------|
| id | INTEGER PK | 自動採番 |
| name | TEXT NOT NULL | 品名 |
| delivery_batches | REAL DEFAULT 1.0 | 納品＝何回作成分か（小数可） |
| batch_yield | REAL DEFAULT 1.0 | 1回の出来上がり量 |
| bowl_amount | REAL DEFAULT 0 | ラーメン一杯の使用量 |
| bowl_unit | TEXT DEFAULT 'L' | 単位（L, g 等） |
| packing_fee | REAL DEFAULT 0 | 梱包料 |
| target_price | REAL DEFAULT 0 | 販売価格（売値） |

> **v3変更ポイント**: `delivery_unit_amount`/`delivery_unit_type` を廃止。「何回分」と「出来上がり量」で管理する方式に変更。`bowl_amount`/`bowl_unit`（一杯量）をレシピレベルで管理。

#### `recipe_items`（レシピ構成材料）
| カラム | 型 | 説明 |
|--------|-----|------|
| id | INTEGER PK | 自動採番 |
| parent_recipe_id | INTEGER FK→recipes.id | 親レシピ |
| ingredient_id | INTEGER FK→ingredients.id (NULL可) | 使用する原材料 |
| child_recipe_id | INTEGER FK→recipes.id (NULL可) | サブレシピ |
| quantity | REAL | 1回作るときの使用量（小数可） |

> **v3変更ポイント**: `amount_per_bowl` を削除（一杯量はレシピレベルに統合）。`quantity` の定義を「1回作るときの使用量」に明確化。

#### `destinations`（納入先マスター）
| カラム | 型 | 説明 |
|--------|-----|------|
| id | INTEGER PK | 自動採番 |
| name | TEXT NOT NULL | 店舗・納入先名 |
| address | TEXT | 住所等 |
| billing_cycle | INTEGER | 締め日（月末等） |

#### `deliveries`（納品記録）
| カラム | 型 | 説明 |
|--------|-----|------|
| id | INTEGER PK | 自動採番 |
| delivery_number | TEXT UNIQUE | 納品番号（システム自動付与: `YYYYMMDD-NNN`） **【新規】** |
| destination_id | INTEGER FK→destinations.id | 納品先 |
| delivery_date | DATE | 納品日（年月日） |
| invoice_id | INTEGER FK→invoices.id (NULL可) | 紐付く請求書（未請求はNULL） |

#### `delivery_items`（納品明細）
| カラム | 型 | 説明 |
|--------|-----|------|
| id | INTEGER PK | 自動採番 |
| delivery_id | INTEGER FK→deliveries.id | 納品ID |
| recipe_id | INTEGER FK→recipes.id | 納品した品名（レシピ） |
| quantity | REAL | 納品数 |
| current_price | REAL | 納品時の販売価格 |

#### `invoices`（請求書）
| カラム | 型 | 説明 |
|--------|-----|------|
| id | INTEGER PK | 自動採番 |
| destination_id | INTEGER FK→destinations.id | 請求先 |
| target_start_date | DATE | 納入期間（開始日）**【新規】** |
| target_end_date | DATE | 納入期間（終了日）**【新規】** |
| total_amount | REAL | 請求金額（合計額） |
| status | TEXT DEFAULT '未払い' | 未払い/支払済 |

> **変更ポイント**: `billing_month`(YYYY-MM) を廃止し、開始日・終了日による柔軟な期間指定に変更。

---

## 3. 画面構成一覧とUI/UX設計

### 3.1. タブ構成
| タブ名 | 機能 | 対応ユースケース |
|--------|------|----------------|
| ダッシュボード | 原価状況・納品状況のサマリー表示 | - |
| マスター管理 | 材料の登録・一覧 / 納入先の登録・一覧 | UC1 |
| レシピ原価計算 | レシピ作成と構成材料（＋一杯使用量）入力、原価自動計算 | UC2 |
| 納品管理 | 日々の納品記録の登録・一覧 | UC3 |
| 請求書作成 | 期間＋納品先で請求書を自動作成 | UC4 |

> **変更**: 旧「納品・請求管理」タブを「納品管理」と「請求書作成」に分離し、ユースケース3とユースケース4を独立した画面にする。

### 3.2. 各画面の入力項目

#### マスター管理画面（UC1: 材料仕入時）
- **材料登録フォーム**: 材料名、価格（購入金額）、量（仕入量）、単位。単価は自動計算表示。
- **材料一覧テーブル**: 編集・削除ボタン付き
- **材料一覧テーブル**: 編集・削除ボタン付き
- **納入先登録フォーム**: 店舗名、住所
- **納入先一覧テーブル**: 編集・削除ボタン付き

#### レシピ原価計算画面（UC2: レシピ考案時）
- **レシピ基本情報フォーム**:
  - 品名（text）
  - 販売価格（number）
  - 納品＝何回作成分か（number, 小数可）
  - 1回の出来上がり量（number, 小数可）
  - ラーメン一杯の使用量（number, 小数可）＋ 単位（select: L, g 等）
  - 梱包料（number）
- **構成材料追加フォーム**（各材料ごと）:
  - 材料名（select: 原材料 or サブレシピから選択）
  - 1回作るときの使用量（number, 小数可）
- **原価計算結果表示**（リアルタイム）:
  - 1回の原価合計: Σ(使用量 × 材料単価)
  - 納品原価: 1回の原価 × 回数 + 梱包料
  - ラーメン1杯の原価: 1回の原価 ×（一杯使用量 ÷ 出来上がり量）
  - 粗利: 販売価格 - 納品原価
  - 粗利率（%）

#### 納品管理画面（UC3: 納入時）
- **納品登録フォーム**:
  - 納品番号: 自動付与（`YYYYMMDD-NNN`形式・画面には表示のみ・編集不可）
  - 年月日（date）
  - 納品先（select: 納入先マスターから選択）
  - 品名（select: レシピから選択）と納品数（number）の複数行入力
- **納品履歴一覧テーブル**: 過去の納品記録を表示。編集・削除ボタン付き。

#### 請求書作成画面（UC4: 請求業務）
- **条件入力フォーム**:
  - 納入期間: 開始日（date）〜 終了日（date）
  - 納品先（select: 納入先マスターから選択）
- **請求書プレビュー**: 
  - 納品履歴明細（納品日時、品名、納品数、販売価格）
  - 請求金額（合計額）
- **注意**: 請求書は作成後の編集・削除は不可。編集・削除ボタンは表示しない。

---

## 4. APIエンドポイント設計（v2 全量）

### 4.1. 材料API (`/api/ingredients`)
| Method | Path | 説明 | 対応UC |
|--------|------|------|--------|
| GET | `/api/ingredients/` | 材料一覧取得 | UC1 |
| POST | `/api/ingredients/` | 新規材料追加 | UC1 |
| PUT | `/api/ingredients/{id}` | 材料情報更新 **【新規】** | UC1 |
| DELETE | `/api/ingredients/{id}` | 材料削除 **【新規】** | UC1 |

### 4.2. レシピAPI (`/api/recipes`)
| Method | Path | 説明 | 対応UC |
|--------|------|------|--------|
| GET | `/api/recipes/` | レシピ一覧取得 | UC2 |
| POST | `/api/recipes/` | 新規レシピ追加 | UC2 |
| PUT | `/api/recipes/{id}` | レシピ基本情報更新 **【新規】** | UC2 |
| DELETE | `/api/recipes/{id}` | レシピ削除 **【新規】** | UC2 |
| POST | `/api/recipes/{id}/items` | 構成材料の追加（amount_per_bowlを含む）| UC2 |
| GET | `/api/recipes/{id}/items` | 構成材料一覧取得 **【新規】** | UC2 |
| DELETE | `/api/recipes/{id}/items/{item_id}` | 構成材料の削除 **【新規】** | UC2 |
| GET | `/api/recipes/{id}/cost` | 原価計算結果取得（再帰計算） | UC2 |

### 4.3. 納入先API (`/api/destinations`) **【新規】**
| Method | Path | 説明 | 対応UC |
|--------|------|------|--------|
| GET | `/api/destinations/` | 納入先一覧取得 | UC3,4 |
| POST | `/api/destinations/` | 新規納入先追加 | UC3 |
| PUT | `/api/destinations/{id}` | 納入先情報更新 | UC3 |
| DELETE | `/api/destinations/{id}` | 納入先削除 | UC3 |

### 4.4. 納品API (`/api/deliveries`) **【新規】**
| Method | Path | 説明 | 対応UC |
|--------|------|------|--------|
| GET | `/api/deliveries/` | 納品履歴一覧取得（クエリパラメータで絞り込み可） | UC3 |
| POST | `/api/deliveries/` | 新規納品登録（delivery_numberはサーバー側で自動付与） | UC3 |
| PUT | `/api/deliveries/{id}` | 納品記録の編集 **【新規】** | UC3 |
| DELETE | `/api/deliveries/{id}` | 納品記録の削除 **【新規】** | UC3 |

**POST `/api/deliveries/` リクエストボディ例:**
```json
{
  "delivery_date": "2026-04-05",
  "destination_id": 1,
  "items": [
    { "recipe_id": 1, "quantity": 3 },
    { "recipe_id": 2, "quantity": 1 }
  ]
}
```
> `delivery_number` はサーバー側で `YYYYMMDD-NNN` 形式で自動生成する。`current_price` は登録時にバックエンドで当該レシピの `target_price` を自動でセットする。

> **編集・削除ルール**: 納品記録は編集・削除可能。ただし、請求書に紐付け済み（`invoice_id` がNULLでない）の納品は編集・削除不可とする。

### 4.5. 請求書API (`/api/invoices`) **【改修】**
| Method | Path | 説明 | 対応UC |
|--------|------|------|--------|
| POST | `/api/invoices/generate` | 請求書を期間＋納品先で自動生成 | UC4 |
| GET | `/api/invoices/` | 請求書一覧取得 | UC4 |
| GET | `/api/invoices/{id}` | 請求書詳細取得（明細付き） | UC4 |

> **編集・削除不可**: 請求書はPUT/DELETEエンドポイントを提供しない（業務整合性の確保）。

**POST `/api/invoices/generate` リクエストボディ例:**
```json
{
  "destination_id": 1,
  "start_date": "2026-04-01",
  "end_date": "2026-04-30"
}
```

**レスポンス例（明細付き）:**
```json
{
  "invoice_id": 5,
  "destination_name": "蒲田店",
  "target_start_date": "2026-04-01",
  "target_end_date": "2026-04-30",
  "total_amount": 45200,
  "status": "未払い",
  "details": [
    {
      "delivery_date": "2026-04-05",
      "delivery_number": "D-2026-001",
      "recipe_name": "特製かえし",
      "quantity": 3,
      "unit_price": 8000,
      "subtotal": 24000
    },
    {
      "delivery_date": "2026-04-15",
      "delivery_number": "D-2026-005",
      "recipe_name": "赤だれ",
      "quantity": 2,
      "unit_price": 10600,
      "subtotal": 21200
    }
  ]
}
```

---

## 5. 主要な処理・アルゴリズム設計

### 5.1. レシピの再帰的原価計算エンジン（v3改修）
レシピの原価計算は「1回作る」単位を基準に算出する。

**v2（旧ロジック）**: 各材料ごとの `amount_per_bowl × 材料単価` を合算
**v3（新ロジック）**: 一杯量はレシピレベルで管理。`bowl_cost = batch_cost × (bowl_amount / batch_yield)`

```
# 1回の原価（バッチコスト）
batch_cost = 0
for each item in recipe_items:
    if item.ingredient_id:
        batch_cost += item.quantity * ingredient.unit_price
    elif item.child_recipe_id:
        child_batch_cost = calculate_batch_cost(child_recipe_id)
        child_unit_cost = child_batch_cost / child_recipe.batch_yield
        batch_cost += item.quantity * child_unit_cost

# 納品原価
delivery_cost = batch_cost * recipe.delivery_batches + recipe.packing_fee

# 1杯の原価
bowl_cost = batch_cost * (recipe.bowl_amount / recipe.batch_yield)
```

### 5.2. 納品番号自動生成アルゴリズム
1. 納品日（`delivery_date`）を `YYYYMMDD` 形式に変換
2. その日の既存納品レコード数をカウントし、次の連番を算出
3. `YYYYMMDD-NNN`（例: `20260405-001`）を生成して自動付与

### 5.3. 納品登録処理
1. 納品番号の自動生成（上記アルゴリズム）
2. 納入先IDの存在確認
3. 各品名（recipe_id）の存在確認
4. `current_price` = 該当レシピの `target_price` を自動設定
5. `Delivery` + 複数の `DeliveryItem` を一括登録

### 5.3. 請求書生成処理
1. 指定期間・納品先で `deliveries` をフィルタリング（`invoice_id IS NULL` の未請求分のみ）
2. 各 `delivery_items` を集計し、明細データを構築
3. 合計金額を算出
4. `invoices` レコードを作成し、該当 `deliveries` に `invoice_id` を紐付け
5. 明細付きレスポンスを返却

---

## 6. レスポンシブ対応方針
- **モバイルファースト設計**: スマートフォンでの利用を最優先とする。
- 最小幅: 320px（スマホ縦持ち）
- レシピ画面の2カラムレイアウトは、スマホでは縦積み（スタック）に切り替え。
- タブバーはハンバーガーメニューまたはボトムナビに変更。
- テーブルは横スクロールまたはカード形式にリレイアウト。
- タップターゲットは44px×44px以上を確保。

## 7. セキュリティとインフラ構成
- バックエンドAPIとフロントエンド間に、`.env` に設定したID/PWに基づくシンプルな認証機能。
- 将来的にはGCP等へのデプロイを見据え、Dockerコンテナ化しやすい構成。
