from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, database, schemas
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ingredients", tags=["ingredients"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_ingredients(db: Session = Depends(get_db)):
    return db.query(models.Ingredient).all()

@router.post("/")
def create_ingredient(ingredient: schemas.IngredientCreate, db: Session = Depends(get_db)):
    unit_price = ingredient.price / ingredient.quantity if ingredient.quantity > 0 else 0
    db_ingredient = models.Ingredient(
        name=ingredient.name,
        price=ingredient.price,
        quantity=ingredient.quantity,
        unit_type=ingredient.unit_type,
        unit_price=unit_price,
    )
    db.add(db_ingredient)
    db.commit()
    db.refresh(db_ingredient)
    logger.info(f"材料追加: {db_ingredient.name} (単価: {unit_price})")
    return db_ingredient

@router.put("/{ingredient_id}")
def update_ingredient(ingredient_id: int, data: schemas.IngredientUpdate, db: Session = Depends(get_db)):
    ing = db.query(models.Ingredient).filter(models.Ingredient.id == ingredient_id).first()
    if not ing:
        raise HTTPException(status_code=404, detail="材料が見つかりません")
    if data.name is not None:
        ing.name = data.name
    if data.price is not None:
        ing.price = data.price
    if data.quantity is not None:
        ing.quantity = data.quantity
    if data.unit_type is not None:
        ing.unit_type = data.unit_type
    ing.unit_price = ing.price / ing.quantity if ing.quantity > 0 else 0
    db.commit()
    db.refresh(ing)
    logger.info(f"材料更新: ID={ingredient_id}")
    return ing

@router.delete("/{ingredient_id}")
def delete_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    ing = db.query(models.Ingredient).filter(models.Ingredient.id == ingredient_id).first()
    if not ing:
        raise HTTPException(status_code=404, detail="材料が見つかりません")
    db.delete(ing)
    db.commit()
    logger.info(f"材料削除: ID={ingredient_id}")
    return {"message": "削除しました"}
