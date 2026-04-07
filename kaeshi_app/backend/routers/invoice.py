from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import models, database, schemas
import logging
import os
import tempfile
from utils.pdf_generator import generate_invoice_pdf

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/invoices", tags=["invoices"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_invoices(db: Session = Depends(get_db)):
    invoices = db.query(models.Invoice).all()
    result = []
    for inv in invoices:
        dest = db.query(models.Destination).filter(models.Destination.id == inv.destination_id).first()
        result.append({
            "id": inv.id,
            "destination_name": dest.name if dest else "不明",
            "target_start_date": str(inv.target_start_date),
            "target_end_date": str(inv.target_end_date),
            "total_amount": inv.total_amount,
            "status": inv.status,
        })
    return result

@router.get("/{invoice_id}")
def get_invoice_detail(invoice_id: int, db: Session = Depends(get_db)):
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="請求書が見つかりません")
    dest = db.query(models.Destination).filter(models.Destination.id == invoice.destination_id).first()
    deliveries = db.query(models.Delivery).filter(models.Delivery.invoice_id == invoice_id).all()
    details = []
    for d in deliveries:
        items = db.query(models.DeliveryItem).filter(models.DeliveryItem.delivery_id == d.id).all()
        for item in items:
            recipe = db.query(models.Recipe).filter(models.Recipe.id == item.recipe_id).first()
            details.append({
                "delivery_date": str(d.delivery_date),
                "delivery_number": d.delivery_number,
                "recipe_name": recipe.name if recipe else "不明",
                "quantity": item.quantity,
                "unit_price": item.current_price,
                "subtotal": item.current_price * item.quantity,
            })
    return {
        "invoice_id": invoice.id,
        "destination_name": dest.name if dest else "不明",
        "target_start_date": str(invoice.target_start_date),
        "target_end_date": str(invoice.target_end_date),
        "total_amount": invoice.total_amount,
        "status": invoice.status,
        "details": details,
    }

@router.get("/{invoice_id}/pdf")
def get_invoice_pdf(invoice_id: int, db: Session = Depends(get_db)):
    # 請求書詳細を取得（既存のロジックを流用）
    data = get_invoice_detail(invoice_id, db)
    
    # 一時ファイルを作成
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        pdf_path = tmp.name
    
    try:
        generate_invoice_pdf(data, pdf_path)
        return FileResponse(
            pdf_path, 
            media_type="application/pdf", 
            filename=f"invoice_{invoice_id}.pdf"
        )
    except Exception as e:
        logger.error(f"PDF生成エラー: {str(e)}")
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        raise HTTPException(status_code=500, detail=f"PDF生成に失敗しました: {str(e)}")

@router.post("/generate")
def generate_invoice(data: schemas.InvoiceGenerate, db: Session = Depends(get_db)):
    dest = db.query(models.Destination).filter(models.Destination.id == data.destination_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="納入先が見つかりません")
    deliveries = db.query(models.Delivery).filter(
        models.Delivery.destination_id == data.destination_id,
        models.Delivery.delivery_date >= data.start_date,
        models.Delivery.delivery_date <= data.end_date,
        models.Delivery.invoice_id == None,
    ).all()
    if not deliveries:
        return {"message": "該当期間の未請求納品がありません", "total_amount": 0}
    total_amount = 0.0
    for d in deliveries:
        items = db.query(models.DeliveryItem).filter(models.DeliveryItem.delivery_id == d.id).all()
        for item in items:
            total_amount += item.current_price * item.quantity
    new_invoice = models.Invoice(
        destination_id=data.destination_id,
        target_start_date=data.start_date,
        target_end_date=data.end_date,
        total_amount=total_amount,
        status="未払い",
    )
    db.add(new_invoice)
    db.flush()
    for d in deliveries:
        d.invoice_id = new_invoice.id
    db.commit()
    db.refresh(new_invoice)
    logger.info(f"請求書生成: ID={new_invoice.id}, 金額={total_amount}")
    return {"message": "請求書を作成しました", "invoice": {"id": new_invoice.id, "total": new_invoice.total_amount}}

@router.put("/{invoice_id}")
def update_invoice(invoice_id: int, data: schemas.InvoiceUpdate, db: Session = Depends(get_db)):
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="請求書が見つかりません")
    if data.status is not None:
        invoice.status = data.status
    db.commit()
    return {"message": "請求書のステータスを更新しました"}

@router.delete("/{invoice_id}")
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="請求書が見つかりません")
    # 関連する納品伝票の invoice_id を NULL に戻す
    deliveries = db.query(models.Delivery).filter(models.Delivery.invoice_id == invoice_id).all()
    for d in deliveries:
        d.invoice_id = None
    db.delete(invoice)
    db.commit()
    logger.info(f"請求書削除: ID={invoice_id}")
    return {"message": "請求書を削除しました"}
