# UI/UX デザイン仕様書 (V3: Lavender Crystal Intelligent Dashboard)

## 1. デザインコンセプト
「Kaeshi Cost Intelligence」を体現する、知的で透明感のあるダッシュボードデザイン。
単なる「管理画面」を「美しく使いやすい道具」へと昇華させる。

## 2. カラーパレット
- **Main Background**: `linear-gradient(135deg, #a5aeff 0%, #7d84ff 100%)` (鮮やかで深みのあるラベンダー)
- **Deep Text**: `#1e1b4b` (濃紺) - 読みやすさと高級感の核。
- **Glass Panel (Level 1)**: `rgba(255, 255, 255, 0.45)` / `blur(20px)` (メインの広域エリア)
- **Glass Card (Level 2)**: `rgba(255, 255, 255, 0.3)` / `blur(10px)` (中のパーツ単位)
- **Accent Pink**: `#ff608c` (スライダー、重要な強調ポイント)
- **Border**: `rgba(255, 255, 255, 0.4)` (鋭く細い光り)

## 3. タイポグラフィ
- **大文字・見出し**: `Syne`, sans-serif (700) - 幾何学的で強い個性を出す。
- **メインUI/本文**: `Plus Jakarta Sans`, "Zen Kaku Gothic New", "Noto Sans JP", sans-serif (400-600) - モダンで知的。
- **階層**:
  - Hero Title: 2.2rem
  - Section Title: 1.4rem
  - Body / Label: 0.9rem

## 4. コンポーネント定義
- **Nav Rail**: 画面左側に64px幅で固定。アクティブな要素は「光りの筋」で表現。
- **Glass Card**: `border-radius: 20px`, `box-shadow: 0 10px 30px rgba(0,0,0,0.05)`
- **Crystal Input**: 透過背景、フォーカス時にアクセントカラーで内側から光るようなエフェクト。
- **Modern Table**: 枠線を最小限にし、背景の色味の差と余白だけで情報の境界を表現。

## 5. レスポン設計
- **Desktop (1024px+)**: フル機能のダッシュボード、左サイドナビ。
- **Mobile (< 860px)**: ボトムナビゲーションへ移行、カードをフル幅に。
