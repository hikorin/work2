# デプロイ手順書 (Google Cloud Run)

本アプリケーションを Google Cloud Run へデプロイする際の手順をまとめました。

## 1. 事前準備
デプロイを実行する環境（ローカルまたはエージェント）で以下が完了している必要があります。
- **Google Cloud SDK (gcloud)** のインストール
- 公式アカウントでのログイン: `gcloud auth login`
- プロジェクトの設定: `gcloud config set project pokioapps`

## 2. デプロイコマンド
以下のコマンドを **`kaeshi_app` フォルダ直下** で実行してください。

```bash
gcloud run deploy kaeshi-app \
  --source . \
  --region asia-northeast1 \
  --platform managed \
  --quiet
```

### コマンドオプションの説明
- `kaeshi-app`: Cloud Run 上のサービス名
- `--source .`: カレントディレクトリのソースコード（Dockerfile）を使用してビルド
- `--region asia-northeast1`: 東京リージョンを指定
- `--platform managed`: フルマネージド環境を使用
- `--quiet`: 確認ダイアログをスキップし、デフォルト設定で進行

## 3. GitHub への反映
デプロイ後は、必ず最新のソースコードを GitHub の適切なブランチにプッシュしてください。

```bash
git add .
git commit -m "feat: deploy latest version to production"
git push origin debug2
```

---
**作成日**: 2026-04-07
**管理者**: hiko.izaki@gmail.com
