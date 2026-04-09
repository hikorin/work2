import sys
import os
import datetime
# カレントディレクトリをbackendに設定してインポートを解決
sys.path.append(os.path.join(os.getcwd(), "kaeshi_app", "backend"))

import database, models, schemas
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_generate_pdf():
    db = database.SessionLocal()
    # 1. 宛先を作成
    dest = models.Destination(name="テスト商店", address="東京都千代田区1-1")
    db.add(dest)
    db.commit()
    db.refresh(dest)
    
    # 2. レシピがあるか確認
    recipe = db.query(models.Recipe).first()
    if not recipe:
        # レシピがなければ作る
        recipe = models.Recipe(name="テスト醤油だれ", bowl_unit="kg", target_price=1500)
        db.add(recipe)
        db.commit()
        db.refresh(recipe)
    
    # 3. 納品レコードを作成
    delivery_data = {
        "delivery_date": str(datetime.date.today()),
        "destination_id": dest.id,
        "items": [
            {"recipe_id": recipe.id, "quantity": 10.0}
        ]
    }
    response = client.post("/api/deliveries/", json=delivery_data)
    assert response.status_code == 200
    delivery_id = response.json()["id"]
    delivery_number = response.json()["delivery_number"]
    print(f"Created delivery: ID={delivery_id}, Number={delivery_number}")
    
    # 4. PDF生成エンドポイントをテスト
    print(f"Testing PDF generation for delivery ID: {delivery_id}")
    pdf_response = client.get(f"/api/deliveries/{delivery_id}/pdf")
    
    if pdf_response.status_code == 200:
        print("Success! PDF received.")
        print(f"Content-Type: {pdf_response.headers.get('content-type')}")
        print(f"Content-Disposition: {pdf_response.headers.get('content-disposition')}")
        
        # ファイルとして保存して確認（任意）
        with open("test_delivery.pdf", "wb") as f:
            f.write(pdf_response.content)
        print("PDF saved as test_delivery.pdf")
    else:
        print(f"Failed! Status Code: {pdf_response.status_code}")
        print(f"Response: {pdf_response.text}")

if __name__ == "__main__":
    test_generate_pdf()
