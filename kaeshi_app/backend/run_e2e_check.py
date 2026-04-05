import sys
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from database import Base, SessionLocal
from routers.recipe import get_db as recipe_get_db
from routers.invoice import get_db as invoice_get_db
from routers.ingredient import get_db as ingredient_get_db

# Setup test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[recipe_get_db] = override_get_db
app.dependency_overrides[invoice_get_db] = override_get_db
app.dependency_overrides[ingredient_get_db] = override_get_db

client = TestClient(app)

def run_tests():
    print("--- E2E Test Started ---")
    # 1. Create Ingredient
    res = client.post("/api/ingredients/", json={"name": "テスト用醤油", "unit_price": 100, "unit_type": "L"})
    assert res.status_code == 200, res.text
    ing_id = res.json()["id"]
    print(f"Created Ingredient {ing_id}")

    # 2. Create Base Recipe
    res = client.post("/api/recipes/", json={
        "name": "ベースタレ", "yield_amount": 10, "delivery_unit_amount": 1, 
        "amount_per_bowl": 0.1, "packing_fee": 50, "target_price": 1000
    })
    assert res.status_code == 200, res.text
    base_id = res.json()["id"]
    print(f"Created Base Recipe {base_id}")

    # 3. Add Ingredient to Base Recipe
    res = client.post(f"/api/recipes/{base_id}/items", json={
        "ingredient_id": ing_id, "quantity": 5
    })
    assert res.status_code == 200, res.text
    print("Added item to Base Recipe")

    # 4. Check Cost of Base Recipe
    res = client.get(f"/api/recipes/{base_id}/cost")
    assert res.status_code == 200, res.text
    cost_data = res.json()
    assert cost_data["total_yield_cost"] == 500.0, cost_data
    assert cost_data["delivery_unit_cost"] == 100.0, cost_data
    assert cost_data["gross_profit"] == 900.0, cost_data
    print("Base Recipe cost correct!")

    # 5. Create Nested Recipe
    res = client.post("/api/recipes/", json={
        "name": "特製ネギタレ", "yield_amount": 5, "delivery_unit_amount": 1,
        "amount_per_bowl": 0.1, "packing_fee": 10, "target_price": 500
    })
    assert res.status_code == 200, res.text
    nested_id = res.json()["id"]
    print(f"Created Nested Recipe {nested_id}")

    # 6. Add Base Recipe as Item to Nested Recipe
    res = client.post(f"/api/recipes/{nested_id}/items", json={
        "child_recipe_id": base_id, "quantity": 2
    })
    assert res.status_code == 200, res.text
    print("Added base recipe as child item to Nested Recipe")

    # 7. Check Cost of Nested Recipe
    res = client.get(f"/api/recipes/{nested_id}/cost")
    assert res.status_code == 200, res.text
    cost_data = res.json()
    assert cost_data["total_yield_cost"] == 100.0, cost_data
    assert cost_data["delivery_unit_cost"] == 30.0, cost_data
    print("Nested Recipe cost correct!")
    print("--- E2E Test Successfully Completed ---")

if __name__ == "__main__":
    run_tests()
