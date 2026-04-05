from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, database, schemas
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/destinations", tags=["destinations"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_destinations(db: Session = Depends(get_db)):
    return db.query(models.Destination).all()

@router.post("/")
def create_destination(dest: schemas.DestinationCreate, db: Session = Depends(get_db)):
    db_dest = models.Destination(name=dest.name, address=dest.address)
    db.add(db_dest)
    db.commit()
    db.refresh(db_dest)
    logger.info(f"納入先追加: {db_dest.name}")
    return db_dest

@router.put("/{dest_id}")
def update_destination(dest_id: int, data: schemas.DestinationUpdate, db: Session = Depends(get_db)):
    dest = db.query(models.Destination).filter(models.Destination.id == dest_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="納入先が見つかりません")
    if data.name is not None:
        dest.name = data.name
    if data.address is not None:
        dest.address = data.address
    db.commit()
    db.refresh(dest)
    return dest

@router.delete("/{dest_id}")
def delete_destination(dest_id: int, db: Session = Depends(get_db)):
    dest = db.query(models.Destination).filter(models.Destination.id == dest_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="納入先が見つかりません")
    db.delete(dest)
    db.commit()
    return {"message": "削除しました"}
