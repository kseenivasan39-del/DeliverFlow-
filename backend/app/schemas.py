from pydantic import BaseModel
from typing import List, Optional

class ProductCreate(BaseModel):
    mpn: str
    brand: str
    description: str

class AttributeSchema(BaseModel):
    name: str
    value: str
    confidence: float
    status: str

class EvidenceSchema(BaseModel):
    attribute_name: str
    source: str
    page: Optional[str]
    snippet: str

class ProductResponse(BaseModel):
    id: int
    mpn: str
    brand: str
    description: str
    status: str
    attributes: List[AttributeSchema] = []
    evidences: List[EvidenceSchema] = []

class ReviewUpdate(BaseModel):
    attributes: dict[str, str]  # Map of attribute name to updated value or status
