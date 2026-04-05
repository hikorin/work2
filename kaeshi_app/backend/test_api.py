import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from main import app
from database import Base
from routers.recipe import get_db as recipe_get_db
from routers.invoice import get_db as invoice_get_db
from routers.ingredient import get_db as ingredient_get_db
from routers.destination import get_db as destination_get_db
from routers.delivery import get_db as delivery_get_db
import models

engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestSession()
    try: yield db
    finally: db.close()

for dep in [recipe_get_db, invoice_get_db, ingredient_get_db, destination_get_db, delivery_get_db]:
    app.dependency_overrides[dep] = override_get_db

client = TestClient(app)

def setup_test_data():
    db = TestSession()
    for m in [models.DeliveryItem, models.Delivery, models.Invoice, models.RecipeItem, models.Recipe, models.Ingredient, models.Destination]:
        db.query(m).delete()
    db.add(models.Ingredient(id=1, name="Soy", price=1000, quantity=1.0, unit_type="L", unit_price=1000))
    db.add(models.Recipe(id=1, name="Kaeshi", delivery_batches=3, batch_yield=2.0, bowl_amount=0.06, bowl_unit="L", packing_fee=5, target_price=8000))
    db.flush()
    db.add(models.RecipeItem(id=1, parent_recipe_id=1, ingredient_id=1, quantity=1.8))
    db.add(models.Destination(id=1, name="Shop A"))
    db.commit()
    db.close()

@pytest.fixture(autouse=True)
def run_before():
    setup_test_data()
    yield

def test_root():
    assert client.get("/").status_code == 200

# --- Ingredients ---
def test_create_ingredient():
    r = client.post("/api/ingredients/", json={"name": "Sugar", "price": 500, "quantity": 1000, "unit_type": "g"})
    assert r.status_code == 200
    assert r.json()["unit_price"] == 0.5

def test_update_ingredient():
    r = client.put("/api/ingredients/1", json={"price": 2000})
    assert r.json()["unit_price"] == 2000.0

def test_delete_ingredient():
    assert client.delete("/api/ingredients/1").status_code == 200

# --- Recipes ---
def test_create_recipe():
    r = client.post("/api/recipes/", json={"name": "Red", "delivery_batches": 2, "batch_yield": 1.5, "bowl_amount": 0.04, "bowl_unit": "L", "target_price": 5000})
    assert r.json()["delivery_batches"] == 2

def test_update_recipe():
    r = client.put("/api/recipes/1", json={"target_price": 9000})
    assert r.json()["target_price"] == 9000

def test_delete_recipe():
    r = client.post("/api/recipes/", json={"name": "Tmp", "delivery_batches": 1})
    assert client.delete(f"/api/recipes/{r.json()['id']}").status_code == 200

# --- Recipe Items ---
def test_recipe_items():
    r = client.get("/api/recipes/1/items")
    assert len(r.json()) > 0
    assert "quantity" in r.json()[0]
    # amount_per_bowl should NOT be in response
    assert "amount_per_bowl" not in r.json()[0]

def test_add_item():
    r = client.post("/api/recipes/1/items", json={"ingredient_id": 1, "quantity": 0.5})
    assert r.json()["quantity"] == 0.5

def test_delete_item():
    assert client.delete("/api/recipes/1/items/1").status_code == 200

# --- Cost Calculation v3 ---
def test_cost():
    r = client.get("/api/recipes/1/cost")
    d = r.json()
    # batch_cost = 1.8 * 1000 = 1800
    assert d["batch_cost"] == 1800.0
    # delivery_cost = 1800 * 3 + 5 = 5405
    assert d["delivery_cost"] == 5405.0
    # bowl_cost = 1800 * (0.06 / 2.0) = 54
    assert d["bowl_cost"] == 54.0

# --- Destinations ---
def test_destinations():
    r = client.post("/api/destinations/", json={"name": "B", "address": "T"})
    assert client.put(f"/api/destinations/{r.json()['id']}", json={"name": "B2"}).json()["name"] == "B2"
    assert client.delete(f"/api/destinations/{r.json()['id']}").status_code == 200

# --- Deliveries ---
def test_delivery_auto_number():
    r = client.post("/api/deliveries/", json={"delivery_date": "2026-04-05", "destination_id": 1, "items": [{"recipe_id": 1, "quantity": 3}]})
    assert r.json()["delivery_number"].startswith("20260405-")

def test_delete_delivery():
    r = client.post("/api/deliveries/", json={"delivery_date": "2026-04-06", "destination_id": 1, "items": [{"recipe_id": 1, "quantity": 1}]})
    assert client.delete(f"/api/deliveries/{r.json()['id']}").status_code == 200

# --- Invoice ---
def test_invoice():
    client.post("/api/deliveries/", json={"delivery_date": "2026-04-10", "destination_id": 1, "items": [{"recipe_id": 1, "quantity": 2}]})
    r = client.post("/api/invoices/generate", json={"destination_id": 1, "start_date": "2026-04-01", "end_date": "2026-04-30"})
    assert r.json()["invoice"]["total"] == 16000.0

def test_delivery_locked():
    client.post("/api/deliveries/", json={"delivery_date": "2026-05-01", "destination_id": 1, "items": [{"recipe_id": 1, "quantity": 1}]})
    client.post("/api/invoices/generate", json={"destination_id": 1, "start_date": "2026-05-01", "end_date": "2026-05-31"})
    ds = [d for d in client.get("/api/deliveries/").json() if d["invoice_id"]]
    if ds:
        assert client.delete(f"/api/deliveries/{ds[0]['id']}").status_code == 400
