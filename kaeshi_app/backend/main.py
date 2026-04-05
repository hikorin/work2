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

from routers import recipe, invoice, ingredient, destination, delivery
app.include_router(ingredient.router)
app.include_router(recipe.router)
app.include_router(destination.router)
app.include_router(delivery.router)
app.include_router(invoice.router)

@app.get('/')
def read_root():
    return {'status': 'ok', 'message': 'Kaeshi Backend API v2 is running!'}
