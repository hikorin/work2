---
name: mobile-access-setup
description: 開発中のアプリにモバイル端末からアクセスするための設定を自動化するスキルやで！IPアドレスの検出、設定ファイルの更新、サーバーの起動まで全部お任せや！✨
---

# Mobile Access Setup 📱✨

## 概要
このスキルは、ローカルで開発している `kaeshi_app` にスマホやタブレットからアクセスできるようにするためのもんや。
「IPアドレスが変わってて繋がらへん！」とか「サーバーの設定がローカルホスト専用になってる！」なーんてトラブルを爆速で解決するで！🔥

## ワークフロー (Workflow) 🛠️

モバイルからのアクセスをセットアップする時は、以下の手順で進めるんや：

1.  **IPアドレスの特定 (IP Identification)** 🕵️‍♀️
    - **Tailscale 優先**: `tailscale ip -4` が使えるなら、その IP（`100.x.y.z`）を最優先で使うんや！✨ セキュアで便利やからな！
    - **ローカル IP**: Tailscale がない場合は、PowerShell の `Get-NetIPAddress` や Python の `socket` を使って、今のローカルIPv4アドレスを特定する。

2.  **設定ファイルの更新 (Update Config)** 📝
    - `kaeshi_app/frontend/src/components/*.tsx` などの API 接続先 URL を、特定した IP アドレスに書き換える。
    - **正規表現**: `http://[IP]:8000/api` の形式を狙い撃ちして置換するんや！💪

3.  **サーバーの起動とポート開放 (Start & Open Ports)** 🚀
    - **バックエンド (FastAPI)**: `0.0.0.0:8000` で起動。
    - **フロントエンド (Vite)**: `0.0.0.0:5173` で `--host` オプション付きで起動。
    - **ファイアウォール**: スマホからの通信を通すために、Windows ファイアウォールでポート 8000 と 5173 を許可するんや！
      - `New-NetFirewallRule -DisplayName "Allow Kaeshi Backend" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow`
      - `New-NetFirewallRule -DisplayName "Allow Kaeshi Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow`

4.  **Windows の罠対策 (Windows Fixes)** 🛠️
    - PowerShell で `npm` が動かへん時は **`npm.cmd`** を使うべし！
    - 実行ポリシーエラーが出る時は `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` で回避や！🔥

5.  **完了報告 (Output URLs)** 📢
    - ユーザーに最終的な URL をドヤ顔で教える！💖


## リソース (Resources) 📚

### scripts/
- `setup_mobile.py`: 上記のワークフローをまるっと自動でやってくれる最強の Python スクリプトや！

## 使い方 (Usage) 💡

「モバイルからアクセスしたいわー」って言われたら、迷わず `scripts/setup_mobile.py` を実行するんや！
これ一発で全部整うから、あとはユーザーに URL を伝えるだけでOKやで！✨
