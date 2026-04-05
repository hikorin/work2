from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date
from database import Base

class Destination(Base):
    __tablename__ = "destinations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    address = Column(String, default="")

class Ingredient(Base):
    __tablename__ = "ingredients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Float, nullable=False)
    unit_type = Column(String, nullable=False)
    unit_price = Column(Float, default=0.0)

class Recipe(Base):
    __tablename__ = "recipes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    delivery_batches = Column(Float, default=1.0)    # 納品＝何回作成分か
    batch_yield = Column(Float, default=1.0)         # 1回の出来上がり量
    bowl_amount = Column(Float, default=0.0)         # ラーメン一杯の使用量
    bowl_unit = Column(String, default="L")          # 単位
    packing_fee = Column(Float, default=0.0)
    target_price = Column(Float, default=0.0)

class RecipeItem(Base):
    __tablename__ = "recipe_items"
    id = Column(Integer, primary_key=True, index=True)
    parent_recipe_id = Column(Integer, ForeignKey("recipes.id"))
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=True)
    child_recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=True)
    quantity = Column(Float)  # 1回作るときの使用量

class Delivery(Base):
    __tablename__ = "deliveries"
    id = Column(Integer, primary_key=True, index=True)
    delivery_number = Column(String, unique=True, index=True)
    destination_id = Column(Integer, ForeignKey("destinations.id"))
    delivery_date = Column(Date)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=True)

class DeliveryItem(Base):
    __tablename__ = "delivery_items"
    id = Column(Integer, primary_key=True, index=True)
    delivery_id = Column(Integer, ForeignKey("deliveries.id"))
    recipe_id = Column(Integer, ForeignKey("recipes.id"))
    quantity = Column(Float)
    current_price = Column(Float)

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    destination_id = Column(Integer, ForeignKey("destinations.id"))
    target_start_date = Column(Date)
    target_end_date = Column(Date)
    total_amount = Column(Float)
    status = Column(String, default="未払い")
