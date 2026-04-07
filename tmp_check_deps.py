import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

def check_dependencies():
    dotenv_path = os.path.join('kaeshi_app', '.env')
    load_dotenv(dotenv_path)
    
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        return

    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    engine = create_engine(database_url)
    
    output = []
    output.append("--- Detailed ID Check ---")
    
    with engine.connect() as conn:
        targets = [1, 2, 3] # 全チェックや！
        
        for recipe_id in targets:
            row = conn.execute(text("SELECT name FROM recipes WHERE id = :id"), {"id": recipe_id}).fetchone()
            if not row:
                continue
            
            actual_name = row[0]
            output.append(f"\nTarget: {actual_name} (ID: {recipe_id})")

            # RecipeItem
            parents = conn.execute(text("""
                SELECT r.name 
                FROM recipe_items ri 
                JOIN recipes r ON ri.parent_recipe_id = r.id 
                WHERE ri.child_recipe_id = :recipe_id
            """), {"recipe_id": recipe_id}).fetchall()
            
            if parents:
                output.append(f"  - Used in other recipes:")
                for p in parents:
                    output.append(f"    - {p[0]}")
            else:
                output.append("  - NOT used in any other recipes.")

            # DeliveryItem
            deliveries = conn.execute(text("""
                SELECT d.delivery_number 
                FROM delivery_items di 
                JOIN deliveries d ON di.delivery_id = d.id 
                WHERE di.recipe_id = :recipe_id
            """), {"recipe_id": recipe_id}).fetchall()
            
            if deliveries:
                output.append(f"  - Found in delivery notes:")
                for d in deliveries:
                    output.append(f"    - {d[0]}")
            else:
                output.append("  - NOT found in any delivery notes.")

    with open("tmp_output.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(output))

if __name__ == "__main__":
    check_dependencies()
