# --------- Stage 1: Build Frontend ---------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# キャッシュ活用のため package.json を先にコピー
COPY frontend/package.json frontend/package.json ./
# package-lock.jsonが存在しない場合も考慮してインストール
RUN npm install

# ソースを全てコピーしてビルド
COPY frontend/ ./
RUN npm run build

# --------- Stage 2: Setup Backend & Release ---------
FROM python:3.11-slim

WORKDIR /app

# 必要なシステムパッケージのインストール（PostgreSQL接続関連など）
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# バックエンドの依存ファイルインストール
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# バックエンドのコードをコピー
COPY backend/ ./

# フロントエンドのビルドファイルをバックエンドのカレント配下(dist)にコピー
COPY --from=frontend-builder /app/frontend/dist ./dist

# Cloud Run 用 環境変数
ENV PORT=8080
ENV HOST=0.0.0.0
EXPOSE 8080

# 起動コマンド（Cloud Run では PORT 環境変数が勝手に設定されるのでそれに従う）
# ※ sh -c を使い、環境変数 $PORT を展開して uvicorn に渡す
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
