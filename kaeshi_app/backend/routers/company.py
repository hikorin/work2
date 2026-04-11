from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, database, schemas

router = APIRouter(prefix="/api/company", tags=["company"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=schemas.CompanyInfo)
def get_company_info(db: Session = Depends(get_db)):
    company = db.query(models.CompanyInfo).first()
    if not company:
        # 初期データがない場合は空のデータを返すか、作成する
        company = models.CompanyInfo(name="自社名未設定", address="", phone="", bank_account="")
        db.add(company)
        db.commit()
        db.refresh(company)
    return company

@router.put("/", response_model=schemas.CompanyInfo)
def update_company_info(data: schemas.CompanyInfoBase, db: Session = Depends(get_db)):
    company = db.query(models.CompanyInfo).first()
    if not company:
        company = models.CompanyInfo(**data.dict())
        db.add(company)
    else:
        for key, value in data.dict().items():
            setattr(company, key, value)
    db.commit()
    db.refresh(company)
    return company
