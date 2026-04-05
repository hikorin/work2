from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class IngredientCreate(BaseModel):
    name: str
    price: float
    quantity: float
    unit_type: str

class IngredientUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[float] = None
    unit_type: Optional[str] = None

class RecipeCreate(BaseModel):
    name: str
    delivery_batches: float = 1.0   # 何回作成分か
    batch_yield: float = 1.0        # 1回の出来上がり量
    bowl_amount: float = 0.0        # ラーメン一杯の使用量
    bowl_unit: str = "L"
    packing_fee: float = 0.0
    target_price: float = 0.0

class RecipeUpdate(BaseModel):
    name: Optional[str] = None
    delivery_batches: Optional[float] = None
    batch_yield: Optional[float] = None
    bowl_amount: Optional[float] = None
    bowl_unit: Optional[str] = None
    packing_fee: Optional[float] = None
    target_price: Optional[float] = None

class RecipeItemCreate(BaseModel):
    ingredient_id: Optional[int] = None
    child_recipe_id: Optional[int] = None
    quantity: float  # 1回作るときの使用量

class DestinationCreate(BaseModel):
    name: str
    address: str = ""

class DestinationUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None

class DeliveryItemInput(BaseModel):
    recipe_id: int
    quantity: float

class DeliveryCreate(BaseModel):
    delivery_date: date
    destination_id: int
    items: List[DeliveryItemInput]

class DeliveryUpdate(BaseModel):
    delivery_date: Optional[date] = None
    destination_id: Optional[int] = None
    items: Optional[List[DeliveryItemInput]] = None

class InvoiceGenerate(BaseModel):
    destination_id: int
    start_date: date
    end_date: date
