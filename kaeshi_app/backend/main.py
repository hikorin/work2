from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title='Kaeshi Cost App API', version='2.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

from routers import recipe, invoice, ingredient, destination, delivery, company
app.include_router(ingredient.router)
app.include_router(recipe.router)
app.include_router(destination.router)
app.include_router(delivery.router)
app.include_router(invoice.router)
app.include_router(company.router)

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import HTTPException

# ヘルステック用APIとしてパスを変更
@app.get('/api/status')
def read_root():
    return {'status': 'ok', 'message': 'Kaeshi Backend API v2 is running!'}

# フロントエンドの SPA (Single Page Application) 対応
FRONTEND_DIST_DIR = os.path.join(os.path.dirname(__file__), "dist")
if os.path.isdir(FRONTEND_DIST_DIR) or os.path.exists(FRONTEND_DIST_DIR):
    # assets(JS/CSS/画像) をマウント
    assets_path = os.path.join(FRONTEND_DIST_DIR, "assets")
    if os.path.isdir(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    # API以外のすべてのリクエストを index.html に流す (React Router 用)
    @app.get("/{catchall:path}", include_in_schema=False)
    def serve_frontend(catchall: str):
        # /api/ から始まるものはフロントに流さず 404
        if catchall.startswith("api/"):
            raise HTTPException(status_code=404, detail="API Not Found")
            
        # 特定のファイル拡張子(.pngや.icoなど)ならそのファイルを返す
        requested_file = os.path.join(FRONTEND_DIST_DIR, catchall)
        if os.path.isfile(requested_file):
            return FileResponse(requested_file)
            
        # それ以外は index.html を返す
        return FileResponse(os.path.join(FRONTEND_DIST_DIR, "index.html"))
