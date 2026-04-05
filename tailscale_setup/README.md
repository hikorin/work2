# Tailscale 構築ログ 🐲✨

## 概要
TailscaleをWindows PCにインストールするための管理ドキュメントやで！

## インストール手順
1. **winget を利用したインストール**
   以下のコマンドを実行する：
   ```powershell
   winget install --id Tailscale.Tailscale --accept-package-agreements --accept-source-agreements
   ```
2. **実行確認**
   インストール完了後、スタートメニューから `Tailscale` を起動してログインする。

## ステータス
- [x] インストール方法の調査
- [x] winget によるインストール実行
- [x] 動作確認
