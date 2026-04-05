from database import engine, Base
from models import Destination, Ingredient, Recipe, RecipeItem, Delivery, DeliveryItem, Invoice

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Database tables created successfully!")
