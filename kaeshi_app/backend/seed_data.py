import database, models
db = database.SessionLocal()

# Add ingredients
# price=500, quantity=1000ml -> unit_price=0.5
soy_sauce = models.Ingredient(name="醤油", price=500.0, quantity=1000.0, unit_price=0.5, unit_type="ml")
# price=200, quantity=1000g -> unit_price=0.2
salt = models.Ingredient(name="天然塩", price=200.0, quantity=1000.0, unit_price=0.2, unit_type="g")
db.add_all([soy_sauce, salt])
db.commit()

# Add recipes
kaeshi = models.Recipe(
    name="基本のかえし（1L）", 
    batch_yield=1000.0, 
    bowl_amount=15.0, 
    bowl_unit="ml", 
    packing_fee=50.0, 
    target_price=1000.0
)
karanegi = models.Recipe(
    name="からネギのたれ（500g）", 
    batch_yield=500.0, 
    bowl_amount=30.0, 
    bowl_unit="g", 
    packing_fee=20.0, 
    target_price=600.0
)
db.add_all([kaeshi, karanegi])
db.commit()

# Link items (Kaeshi uses 1000ml soy sauce)
item1 = models.RecipeItem(parent_recipe_id=kaeshi.id, ingredient_id=soy_sauce.id, quantity=1000.0)

# Karanegi uses 100ml Kaeshi (child recipe!) + 5g salt
item2 = models.RecipeItem(parent_recipe_id=karanegi.id, child_recipe_id=kaeshi.id, quantity=100.0)
item3 = models.RecipeItem(parent_recipe_id=karanegi.id, ingredient_id=salt.id, quantity=5.0)

db.add_all([item1, item2, item3])
db.commit()

print("Dummy DB Data has been seeded successfully!")
