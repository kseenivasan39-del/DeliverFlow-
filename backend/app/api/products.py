from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from sqlmodel import Session, select
from typing import List

from ..db import get_session
from ..models import Product, Attribute, Evidence
from ..schemas import ProductCreate, ProductResponse, ReviewUpdate, AttributeSchema, EvidenceSchema
from ..services.ai_service import enrich_product
from ..services.export_service import generate_csv

router = APIRouter()

@router.post("/", response_model=ProductResponse)
def create_product(product: ProductCreate, session: Session = Depends(get_session)):
    existing = session.exec(select(Product).where(Product.mpn == product.mpn)).first()
    if existing:
        return existing
        
    db_product = Product(mpn=product.mpn, brand=product.brand, description=product.description)
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/", response_model=List[ProductResponse])
def list_products(session: Session = Depends(get_session)):
    products = session.exec(select(Product)).all()
    return products

@router.delete("/reset")
def reset_database(session: Session = Depends(get_session)):
    from ..db import engine
    from sqlmodel import SQLModel
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    return {"status": "success", "message": "Database reset"}

@router.post("/{product_id}/enrich", response_model=ProductResponse)
def enrich_product_api(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Clean old attributes/evidences if re-enriching
    for attr in list(product.attributes):
        session.delete(attr)
    for ev in list(product.evidences):
        session.delete(ev)
    
    product.attributes.clear()
    product.evidences.clear()
    session.commit()
    
    # Run AI pipeline (Mocked for MVP)
    attributes, evidences = enrich_product(product.mpn, product.description)
    
    for attr in attributes:
        attr.product_id = product.id
        session.add(attr)
        
    for ev in evidences:
        ev.product_id = product.id
        session.add(ev)
        
    product.status = "enriched"
    session.add(product)
    session.commit()
    session.refresh(product)
    
    return product

@router.get("/{product_id}/evidence", response_model=List[EvidenceSchema])
def get_evidence(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product.evidences

@router.post("/{product_id}/review", response_model=ProductResponse)
def review_product(product_id: int, review: ReviewUpdate, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    for attr in product.attributes:
        if attr.name in review.attributes:
            attr.value = review.attributes[attr.name]
            attr.status = "verified"
            session.add(attr)
            
    product.status = "reviewed"
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

@router.post("/{product_id}/reject", response_model=ProductResponse)
def reject_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product.status = "rejected"
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

@router.get("/{product_id}/export/json", response_model=ProductResponse)
def export_json(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/{product_id}/export/csv", response_class=PlainTextResponse)
def export_csv(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    csv_data = generate_csv(product)
    return PlainTextResponse(content=csv_data, media_type="text/csv")
