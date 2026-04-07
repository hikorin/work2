import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.units import mm
from datetime import datetime

# 日本語フォントの設定（OSに合わせてパスを切り替える）
FONT_NAME = "HeiseiMin-W3" # 標準的な日本語フォント名（ReportLabの組み込みフォントではないので登録が必要）
FONT_PATHS = [
    r"C:\Windows\Fonts\msmincho.ttc",       # Windows
    "/usr/share/fonts/opentype/ipaexfont-mincho/ipaexm.ttf", # Linux (IPA)
    "/usr/share/fonts/truetype/fonts-japanese-mincho.ttf"    # Linux (Common)
]

def setup_font():
    for path in FONT_PATHS:
        if os.path.exists(path):
            try:
                pdfmetrics.registerFont(TTFont("Japanese-Font", path))
                return "Japanese-Font"
            except Exception:
                continue
    # フォントが見つからない場合はデフォルトのHelvetica（日本語不可）を返す
    return "Helvetica"

def generate_invoice_pdf(invoice_data: dict, output_path: str):
    font = setup_font()
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4

    # タイトル
    c.setFont(font, 20)
    c.drawCentredString(width / 2, height - 20 * mm, "請求書")

    # 宛先
    c.setFont(font, 12)
    c.drawString(20 * mm, height - 40 * mm, f"宛先: {invoice_data['destination_name']} 様")

    # 請求期間と合計金額
    c.drawString(20 * mm, height - 50 * mm, f"請求期間: {invoice_data['target_start_date']} 〜 {invoice_data['target_end_date']}")
    c.setFont(font, 16)
    c.drawString(20 * mm, height - 60 * mm, f"合計金額: ￥{invoice_data['total_amount']:,}")

    # 明細のヘッダー
    c.setFont(font, 10)
    y = height - 80 * mm
    c.line(20 * mm, y + 2 * mm, width - 20 * mm, y + 2 * mm)
    c.drawString(20 * mm, y, "納品日")
    c.drawString(50 * mm, y, "商品名")
    c.drawString(100 * mm, y, "数量")
    c.drawString(120 * mm, y, "単価")
    c.drawString(150 * mm, y, "小計")
    c.line(20 * mm, y - 2 * mm, width - 20 * mm, y - 2 * mm)

    # 明細行
    y -= 10 * mm
    for item in invoice_data["details"]:
        if y < 20 * mm:  # 改ページ処理（簡易版）
            c.showPage()
            c.setFont(font, 10)
            y = height - 20 * mm
        
        c.drawString(20 * mm, y, item["delivery_date"])
        c.drawString(50 * mm, y, item["recipe_name"][:20]) # 名前が長すぎる場合はカット
        c.drawString(100 * mm, y, f"{item['quantity']:,}")
        c.drawString(120 * mm, y, f"{item['unit_price']:,}")
        c.drawString(150 * mm, y, f"{item['subtotal']:,}")
        y -= 7 * mm

    c.save()
    return output_path
