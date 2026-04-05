from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, database, schemas
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/recipes", tags=["recipes"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_recipes(db: Session = Depends(get_db)):
    return db.query(models.Recipe).all()

@router.post("/")
def create_recipe(recipe: schemas.RecipeCreate, db: Session = Depends(get_db)):
    db_recipe = models.Recipe(
        name=recipe.name, delivery_batches=recipe.delivery_batches,
        batch_yield=recipe.batch_yield, bowl_amount=recipe.bowl_amount,
        bowl_unit=recipe.bowl_unit, packing_fee=recipe.packing_fee,
        target_price=recipe.target_price,
    )
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    logger.info(f"レシピ作成: {db_recipe.name}")
    return db_recipe

@router.put("/{recipe_id}")
def update_recipe(recipe_id: int, data: schemas.RecipeUpdate, db: Session = Depends(get_db)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="レシピが見つかりません")
    for field in ["name", "delivery_batches", "batch_yield", "bowl_amount", "bowl_unit", "packing_fee", "target_price"]:
        val = getattr(data, field, None)
        if val is not None:
            setattr(recipe, field, val)
    db.commit()
    db.refresh(recipe)
    return recipe

@router.delete("/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="レシピが見つかりません")
    db.query(models.RecipeItem).filter(models.RecipeItem.parent_recipe_id == recipe_id).delete()
    db.delete(recipe)
    db.commit()
    return {"message": "削除しました"}

@router.get("/{recipe_id}/items")
def get_recipe_items(recipe_id: int, db: Session = Depends(get_db)):
    items = db.query(models.RecipeItem).filter(models.RecipeItem.parent_recipe_id == recipe_id).all()
    result = []
    for item in items:
        entry = {"id": item.id, "quantity": item.quantity}
        if item.ingredient_id:
            ing = db.query(models.Ingredient).filter(models.Ingredient.id == item.ingredient_id).first()
            entry.update({"type": "ingredient", "ingredient_id": item.ingredient_id,
                          "name": ing.name if ing else "不明", "unit_price": ing.unit_price if ing else 0,
                          "unit_type": ing.unit_type if ing else ""})
        elif item.child_recipe_id:
            child = db.query(models.Recipe).filter(models.Recipe.id == item.child_recipe_id).first()
            entry.update({"type": "recipe", "child_recipe_id": item.child_recipe_id,
                          "name": child.name if child else "不明"})
        result.append(entry)
    return result

@router.post("/{recipe_id}/items")
def add_recipe_item(recipe_id: int, item: schemas.RecipeItemCreate, db: Session = Depends(get_db)):
    if not db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first():
        raise HTTPException(status_code=404, detail="親レシピが見つかりません")
    db_item = models.RecipeItem(parent_recipe_id=recipe_id, ingredient_id=item.ingredient_id,
                                 child_recipe_id=item.child_recipe_id, quantity=item.quantity)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{recipe_id}/items/{item_id}")
def delete_recipe_item(recipe_id: int, item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.RecipeItem).filter(models.RecipeItem.id == item_id, models.RecipeItem.parent_recipe_id == recipe_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="構成材料が見つかりません")
    db.delete(item)
    db.commit()
    return {"message": "削除しました"}

# --- 原価計算 v3 ---
def calculate_batch_cost(recipe_id: int, db: Session) -> float:
    """1回作るときの原価 = Σ(材料使用量 × 材料単価)"""
    total = 0.0
    items = db.query(models.RecipeItem).filter(models.RecipeItem.parent_recipe_id == recipe_id).all()
    for item in items:
        if item.ingredient_id:
            ing = db.query(models.Ingredient).filter(models.Ingredient.id == item.ingredient_id).first()
            if ing:
                total += item.quantity * ing.unit_price
        elif item.child_recipe_id:
            child_batch_cost = calculate_batch_cost(item.child_recipe_id, db)
            child = db.query(models.Recipe).filter(models.Recipe.id == item.child_recipe_id).first()
            if child and child.batch_yield > 0:
                total += item.quantity * (child_batch_cost / child.batch_yield)
    return total

@router.get("/{recipe_id}/cost")
def get_recipe_cost(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404)
    batch_cost = calculate_batch_cost(recipe_id, db)
    delivery_cost = batch_cost * recipe.delivery_batches + (recipe.packing_fee or 0)
    # 1杯の原価 = 1回の原価 × (一杯使用量 / 出来上がり量)
    bowl_cost = 0.0
    if recipe.batch_yield > 0 and recipe.bowl_amount > 0:
        bowl_cost = batch_cost * (recipe.bowl_amount / recipe.batch_yield)
    target_price = recipe.target_price or 0
    gross_profit = target_price - delivery_cost
    gross_margin = (gross_profit / target_price * 100) if target_price > 0 else 0
    return {
        "recipe_id": recipe_id,
        "batch_cost": batch_cost,
        "delivery_cost": delivery_cost,
        "bowl_cost": bowl_cost,
        "gross_profit": gross_profit,
        "gross_profit_margin": gross_margin,
        "target_price": target_price,
    }
