from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import datetime
import os
import tempfile
import models, database, schemas
import logging
from utils.pdf_generator import generate_delivery_pdf

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/deliveries", tags=["deliveries"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def generate_delivery_number(delivery_date: datetime.date, db: Session) -> str:
    """YYYYMMDD-NNN 形式の納品番号を自動生成"""
    date_str = delivery_date.strftime("%Y%m%d")
    count = db.query(models.Delivery).filter(
        models.Delivery.delivery_number.like(f"{date_str}-%")
    ).count()
    return f"{date_str}-{str(count + 1).zfill(3)}"

@router.get("/")
def get_deliveries(destination_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Delivery)
    if destination_id:
        query = query.filter(models.Delivery.destination_id == destination_id)
    deliveries = query.order_by(models.Delivery.delivery_date.desc()).all()
    result = []
    for d in deliveries:
        dest = db.query(models.Destination).filter(models.Destination.id == d.destination_id).first()
        items = db.query(models.DeliveryItem).filter(models.DeliveryItem.delivery_id == d.id).all()
        item_list = []
        for item in items:
            recipe = db.query(models.Recipe).filter(models.Recipe.id == item.recipe_id).first()
            item_list.append({
                "recipe_id": item.recipe_id,
                "recipe_name": recipe.name if recipe else "不明",
                "quantity": item.quantity,
                "current_price": item.current_price,
            })
        result.append({
            "id": d.id,
            "delivery_number": d.delivery_number,
            "delivery_date": str(d.delivery_date),
            "destination_id": d.destination_id,
            "destination_name": dest.name if dest else "不明",
            "invoice_id": d.invoice_id,
            "items": item_list,
        })
    return result

@router.post("/")
def create_delivery(data: schemas.DeliveryCreate, db: Session = Depends(get_db)):
    dest = db.query(models.Destination).filter(models.Destination.id == data.destination_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="納入先が見つかりません")
    delivery_number = generate_delivery_number(data.delivery_date, db)
    delivery = models.Delivery(
        delivery_number=delivery_number,
        destination_id=data.destination_id,
        delivery_date=data.delivery_date,
    )
    db.add(delivery)
    db.flush()
    for item in data.items:
        recipe = db.query(models.Recipe).filter(models.Recipe.id == item.recipe_id).first()
        if not recipe:
            raise HTTPException(status_code=404, detail=f"レシピID {item.recipe_id} が見つかりません")
        db_item = models.DeliveryItem(
            delivery_id=delivery.id,
            recipe_id=item.recipe_id,
            quantity=item.quantity,
            current_price=recipe.target_price,
        )
        db.add(db_item)
    db.commit()
    db.refresh(delivery)
    logger.info(f"納品登録: {delivery_number}")
    return {"id": delivery.id, "delivery_number": delivery_number, "message": "納品を登録しました"}

@router.put("/{delivery_id}")
def update_delivery(delivery_id: int, data: schemas.DeliveryUpdate, db: Session = Depends(get_db)):
    delivery = db.query(models.Delivery).filter(models.Delivery.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="納品記録が見つかりません")
    if delivery.invoice_id is not None:
        raise HTTPException(status_code=400, detail="請求書に紐付け済みの納品は編集できません")
    if data.delivery_date is not None:
        delivery.delivery_date = data.delivery_date
    if data.destination_id is not None:
        delivery.destination_id = data.destination_id
    if data.items is not None:
        db.query(models.DeliveryItem).filter(models.DeliveryItem.delivery_id == delivery_id).delete()
        for item in data.items:
            recipe = db.query(models.Recipe).filter(models.Recipe.id == item.recipe_id).first()
            if not recipe:
                raise HTTPException(status_code=404, detail=f"レシピID {item.recipe_id} が見つかりません")
            db_item = models.DeliveryItem(
                delivery_id=delivery_id, recipe_id=item.recipe_id,
                quantity=item.quantity, current_price=recipe.target_price,
            )
            db.add(db_item)
    db.commit()
    return {"message": "納品記録を更新しました"}

@router.delete("/{delivery_id}")
def delete_delivery(delivery_id: int, db: Session = Depends(get_db)):
    delivery = db.query(models.Delivery).filter(models.Delivery.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="納品記録が見つかりません")
    if delivery.invoice_id is not None:
        raise HTTPException(status_code=400, detail="請求書に紐付け済みの納品は削除できません")
    db.query(models.DeliveryItem).filter(models.DeliveryItem.delivery_id == delivery_id).delete()
    db.delete(delivery)
    db.commit()
    logger.info(f"納品削除: ID={delivery_id}")
    return {"message": "削除しました"}

@router.get("/{delivery_id}/pdf")
def get_delivery_pdf(delivery_id: int, db: Session = Depends(get_db)):
    delivery = db.query(models.Delivery).filter(models.Delivery.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="納品記録が見つかりません")
    
    dest = db.query(models.Destination).filter(models.Destination.id == delivery.destination_id).first()
    items = db.query(models.DeliveryItem).filter(models.DeliveryItem.delivery_id == delivery.id).all()
    
    # 自社情報を取得
    company = db.query(models.CompanyInfo).first()
    company_data = {
        "name": company.name if company else "自社名未設定",
        "address": company.address if company else "",
        "phone": company.phone if company else ""
    }
    
    item_list = []
    for item in items:
        recipe = db.query(models.Recipe).filter(models.Recipe.id == item.recipe_id).first()
        item_list.append({
            "name": recipe.name if recipe else "不明",
            "quantity": item.quantity,
            "unit": recipe.bowl_unit if recipe else "個",
            "note": "" # 必要に応じて追加
        })
    
    delivery_data = {
        "delivery_number": delivery.delivery_number,
        "delivery_date": str(delivery.delivery_date),
        "destination_name": dest.name if dest else "不明",
        "items": item_list,
        "company": company_data
    }
    
    # 一時ファイルを作成
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        pdf_path = tmp.name
    
    try:
        generate_delivery_pdf(delivery_data, pdf_path)
        filename = f"delivery_{delivery.delivery_number}.pdf"
        return FileResponse(
            pdf_path, 
            media_type="application/pdf", 
            filename=filename
        )
    except Exception as e:
        logger.error(f"PDF生成エラー: {str(e)}")
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        raise HTTPException(status_code=500, detail=f"PDF生成に失敗しました: {str(e)}")
