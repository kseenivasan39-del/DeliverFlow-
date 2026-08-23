from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    mpn: str
    brand: str
    description: str
    status: str = Field(default="pending")  # pending, enriched, reviewed
    
    attributes: List["Attribute"] = Relationship(back_populates="product")
    evidences: List["Evidence"] = Relationship(back_populates="product")

class Attribute(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: Optional[int] = Field(default=None, foreign_key="product.id")
    name: str
    value: str
    confidence: float
    status: str = Field(default="extracted")  # extracted, verified, conflict, low_confidence, overridden
    
    product: Optional[Product] = Relationship(back_populates="attributes")

class Evidence(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: Optional[int] = Field(default=None, foreign_key="product.id")
    attribute_name: str
    source: str
    page: Optional[str]
    snippet: str
    
    product: Optional[Product] = Relationship(back_populates="evidences")
