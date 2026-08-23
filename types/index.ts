
export interface Source {
  id: string;
  name: string;
  type: string;
  url?: string;
  page?: string;
  snippet?: string;
  trustLevel: string;
}

export interface Evidence {
  sourceId: string;
  snippet: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
  confidence: number;
  status: 'Verified' | 'Needs Review' | 'Low Confidence' | 'Unknown';
  evidence?: Evidence[];
  conflict?: {
    suggestedValue: string;
    confidence: number;
    sources: { sourceId: string; value: string; confidence: number }[];
  };
}

export interface Product {
  id: string;
  mpn: string;
  brand: string;
  description: string;
  confidence: number;
  status: 'Verified' | 'Needs Review' | 'Processing';
  attributes: ProductAttribute[];
  sources: Source[];
}
