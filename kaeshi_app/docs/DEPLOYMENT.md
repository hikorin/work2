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

> [!IMPORTANT]
> **環境変数について**: 既存の Cloud Run サービス `kaeshi-app` には、すでに Neon (PostgreSQL) の `DATABASE_URL` が環境変数として設定されています。そのため、上記のコマンドを実行するだけで、以前の設定を引き継いだまま最新版がデプロイされます！😎✨

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

## 4. Windows (PowerShell) での注意点
PowerShell を使用してデプロイ作業を行う際、環境によっては以下のエラーが発生することがあります。その場合の対処法をまとめました。

### gcloud コマンドの呼び出し
PowerShell の実行ポリシー（Execution Policy）の設定により、標準の `gcloud` コマンド（.ps1 スクリプト）がブロックされる場合があります。その際は、拡張子を明示した **`gcloud.cmd`** を直接呼び出すことで実行可能です。

### コマンド連結の記法
PowerShell の古いバージョンでは、Bash のように `&&` でコマンドを連結することができません。複数のコマンドを一行で連続実行したい場合は、セミコロン **`;`** を使用してください。

### 実行例
PowerShell でデプロイ設定を確認しつつ実行する例です：

```powershell
# gcloud.cmd を使用してプロジェクト設定とデプロイを連続実行
gcloud.cmd config set project pokioapps; gcloud.cmd run deploy kaeshi-app --source . --region asia-northeast1 --platform managed --quiet
```

---
**作成日**: 2026-04-07
**管理者**: hiko.izaki@gmail.com
