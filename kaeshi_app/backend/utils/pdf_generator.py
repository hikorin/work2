import os
import logging
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.lib.units import mm
from datetime import datetime

# ログの設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 日本語フォント候補（OSに合わせてパスを切り替える）
FONT_PATHS = [
    r"C:\Windows\Fonts\msmincho.ttc",       # Windows (明朝)
    r"C:\Windows\Fonts\msgothic.ttc",       # Windows (ゴシック)
    "/usr/share/fonts/opentype/ipaexfont-mincho/ipaexm.ttf", # Linux (IPA)
    "/usr/share/fonts/truetype/fonts-japanese-mincho.ttf",   # Linux (Common)
    "/usr/share/fonts/truetype/ipafont/ipag.ttf"            # Ubuntu (IPA Gothic)
]

def setup_font():
    # 1. TrueTypeフォントの登録を試みる
    for path in FONT_PATHS:
        if os.path.exists(path):
            try:
                font_name = "Japanese-TTF"
                pdfmetrics.registerFont(TTFont(font_name, path))
                logger.info(f"Successfully registered TTF font: {path}")
                return font_name
            except Exception as e:
                logger.warning(f"Failed to register TTF font {path}: {e}")
                continue
    
    # 2. ファイルが見つからない場合は標準CIDフォント（HeiseiMin-W3）を試す
    try:
        font_name = "HeiseiMin-W3"
        pdfmetrics.registerFont(UnicodeCIDFont(font_name))
        logger.info(f"Using fallback CID font: {font_name}")
        return font_name
    except Exception as e:
        logger.error(f"Failed to register CID font: {e}")
    
    # 3. 最終手段（日本語不可）
    logger.error("No Japanese font found! Falling back to Helvetica (expect mojibake).")
    return "Helvetica"

def generate_invoice_pdf(invoice_data: dict, output_path: str):
    font = setup_font()
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4

    # タイトル
    c.setFont(font, 20)
    c.drawCentredString(width / 2, height - 20 * mm, "請求書")

    # 請求書番号と自社情報（右上に配置）
    c.setFont(font, 10)
    c.drawRightString(width - 20 * mm, height - 30 * mm, f"請求書番号: {invoice_data.get('invoice_number', '---')}")
    c.drawRightString(width - 20 * mm, height - 35 * mm, f"発行日: {datetime.now().strftime('%Y年%m月%d日')}")
    
    y_info = height - 45 * mm
    c.drawRightString(width - 20 * mm, y_info, invoice_data.get("company_name", ""))
    c.drawRightString(width - 20 * mm, y_info - 5 * mm, invoice_data.get("company_address", ""))
    c.drawRightString(width - 20 * mm, y_info - 10 * mm, f"TEL: {invoice_data.get('company_phone', '')}")

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
        if y < 40 * mm:  # 振込先エリアを確保するため、少し早めに改ページ
            c.showPage()
            c.setFont(font, 10)
            y = height - 20 * mm
        
        c.drawString(20 * mm, y, item["delivery_date"])
        c.drawString(50 * mm, y, item["recipe_name"][:20])
        c.drawString(100 * mm, y, f"{item['quantity']:,}")
        c.drawString(120 * mm, y, f"{item['unit_price']:,}")
        c.drawString(150 * mm, y, f"{item['subtotal']:,}")
        y -= 7 * mm

    # 振込先情報（下部に配置）
    y_bank = 30 * mm
    c.line(20 * mm, y_bank + 5 * mm, width - 20 * mm, y_bank + 5 * mm)
    c.setFont(font, 10)
    c.drawString(20 * mm, y_bank, "【振込先】")
    c.drawString(40 * mm, y_bank, invoice_data.get("company_bank", ""))

    c.save()
    return output_path

def generate_delivery_pdf(delivery_data: dict, output_path: str):
    font = setup_font()
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4

    # タイトル
    c.setFont(font, 20)
    c.drawCentredString(width / 2, height - 20 * mm, "納品書")

    # 納品番号と日付（右上に配置）
    c.setFont(font, 10)
    c.drawRightString(width - 20 * mm, height - 30 * mm, f"納品番号: {delivery_data['delivery_number']}")
    c.drawRightString(width - 20 * mm, height - 35 * mm, f"納品日: {delivery_data['delivery_date']}")

    # 自社情報（右上に配置）
    company = delivery_data.get("company", {})
    y_info = height - 45 * mm
    c.drawRightString(width - 20 * mm, y_info, company.get("name", ""))
    c.drawRightString(width - 20 * mm, y_info - 5 * mm, company.get("address", ""))
    c.drawRightString(width - 20 * mm, y_info - 10 * mm, f"TEL: {company.get('phone', '')}")

    # 宛先
    c.setFont(font, 14)
    c.drawString(20 * mm, height - 45 * mm, f"{delivery_data['destination_name']} 御中")
    c.line(20 * mm, height - 47 * mm, 100 * mm, height - 47 * mm)

    # 挨拶など
    c.setFont(font, 10)
    c.drawString(20 * mm, height - 55 * mm, "下記の通り、納品申し上げます。")

    # 明細のヘッダー
    y = height - 70 * mm
    c.line(20 * mm, y + 2 * mm, width - 20 * mm, y + 2 * mm)
    c.drawString(25 * mm, y, "品目 / 商品名")
    c.drawRightString(130 * mm, y, "数量")
    c.drawString(135 * mm, y, "単位")
    c.drawString(155 * mm, y, "備考")
    c.line(20 * mm, y - 2 * mm, width - 20 * mm, y - 2 * mm)

    # 明細行
    y -= 10 * mm
    for item in delivery_data["items"]:
        if y < 30 * mm:  # 改ページ処理
            c.showPage()
            c.setFont(font, 10)
            y = height - 30 * mm
            # ヘッダー再描画
            c.line(20 * mm, y + 2 * mm, width - 20 * mm, y + 2 * mm)
            c.drawString(25 * mm, y, "品目 / 商品名")
            c.drawRightString(130 * mm, y, "数量")
            c.drawString(135 * mm, y, "単位")
            c.drawString(155 * mm, y, "備考")
            c.line(20 * mm, y - 2 * mm, width - 20 * mm, y - 2 * mm)
            y -= 10 * mm
        
        c.drawString(25 * mm, y, item["name"][:30])
        c.drawRightString(130 * mm, y, f"{item['quantity']:,}")
        c.drawString(135 * mm, y, item.get("unit", ""))
        c.drawString(155 * mm, y, item.get("note", ""))
        
        y -= 8 * mm
        c.line(20 * mm, y + 1 * mm, width - 20 * mm, y + 1 * mm)

    # フッター（下部に線を引くなど）
    c.line(20 * mm, 25 * mm, width - 20 * mm, 25 * mm)
    c.setFont(font, 8)
    c.drawRightString(width - 20 * mm, 20 * mm, "以上")

    c.save()
    return output_path
