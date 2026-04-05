import database, models
db = database.SessionLocal()

# Add ingredients
soy_sauce = models.Ingredient(name="醤油", unit_price=0.5, unit_type="ml")
salt = models.Ingredient(name="天然塩", unit_price=0.2, unit_type="g")
db.add_all([soy_sauce, salt])
db.commit()

# Add recipes
kaeshi = models.Recipe(name="基本のかえし（1L）", yield_amount=1000.0, packing_fee=50.0, target_price=1000.0)
karanegi = models.Recipe(name="からネギのたれ（500g）", yield_amount=500.0, packing_fee=20.0, target_price=600.0)
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
