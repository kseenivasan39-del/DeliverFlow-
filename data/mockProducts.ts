
import { Product, Source } from '../types';

export const mockSources: Source[] = [
  { id: 's1', name: 'Manufacturer Datasheet', type: 'PDF', page: '7', trustLevel: 'High' },
  { id: 's2', name: 'Manufacturer Product Page', type: 'Web', trustLevel: 'High' },
  { id: 's3', name: 'Technical Catalog', type: 'PDF', page: '12', trustLevel: 'Medium' },
  { id: 's4', name: 'Distributor Product Page', type: 'Web', trustLevel: 'Low' }
];

export const mockProduct: Product = {
  id: 'p1',
  mpn: 'VAL-316-100',
  brand: 'Acme Industrial',
  description: 'Stainless steel industrial valve',
  confidence: 94,
  status: 'Needs Review',
  sources: [mockSources[0], mockSources[1], mockSources[2]],
  attributes: [
    { id: 'a1', name: 'Category', value: 'Industrial Valves', confidence: 98, status: 'Verified', evidence: [{ sourceId: 's1', snippet: 'Category: Industrial Valves' }] },
    { id: 'a2', name: 'Material', value: '316 Stainless Steel', confidence: 96, status: 'Verified', evidence: [{ sourceId: 's1', snippet: 'Material: 316 Stainless Steel' }] },
    { id: 'a3', name: 'Pressure', value: '10 bar', confidence: 93, status: 'Needs Review', conflict: {
      suggestedValue: '16 bar',
      confidence: 61,
      sources: [
        { sourceId: 's1', value: '10 bar', confidence: 93 },
        { sourceId: 's4', value: '16 bar', confidence: 61 }
      ]
    } },
    { id: 'a4', name: 'Connection', value: '1/2 NPT', confidence: 91, status: 'Verified' },
    { id: 'a5', name: 'Temperature Range', value: '-20°C to 180°C', confidence: 94, status: 'Verified' },
    { id: 'a6', name: 'Product Description', value: 'Stainless steel industrial valve suitable for high-pressure applications', confidence: 90, status: 'Verified' }
  ]
};

export const dashboardProducts = [
  {
    id: 'p2',
    mpn: 'PDSH4816AF',
    brand: 'FRIGIDAIRE',
    description: 'Professional Series PDSH4816AF Dishwasher With CleanBoost™, Leg Mounting, 5-Wash Cycle, Stainless Steel',
    confidence: 99,
    status: 'Verified',
    sources: [mockSources[0], mockSources[1]],
    attributes: [
      { id: 'a1', name: 'Series', value: 'Professional Series', confidence: 99, status: 'Verified' },
      { id: 'a2', name: 'Number of Wash Cycles', value: '5', confidence: 99, status: 'Verified' },
      { id: 'a3', name: 'Voltage Rating', value: '120', uom: 'V', confidence: 99, status: 'Verified' },
      { id: 'a4', name: 'Amperage Rating', value: '15', uom: 'A', confidence: 99, status: 'Verified' },
      { id: 'a5', name: 'Mounting Type', value: 'Leg', confidence: 99, status: 'Verified' },
      { id: 'a6', name: 'Size', value: '24 in W x 24-1/4 in D', confidence: 99, status: 'Verified' },
      { id: 'a7', name: 'Depth With Door Open', value: '50-1/4', uom: 'in', confidence: 99, status: 'Verified' },
      { id: 'a8', name: 'Sound Level', value: '47', uom: 'dBA', confidence: 99, status: 'Verified' },
      { id: 'a9', name: 'Material', value: 'Stainless Steel', confidence: 99, status: 'Verified' }
    ]
  },
  {
    id: 'p3',
    mpn: 'WDTS7024RZ',
    brand: 'Whirlpool',
    description: 'Eco Series WDTS7024RZ Dishwasher, Built-in Mounting, Stainless Steel',
    confidence: 98,
    status: 'Verified',
    sources: [mockSources[1]],
    attributes: [
      { id: 'b1', name: 'Series', value: 'Eco Series', confidence: 98, status: 'Verified' },
      { id: 'b2', name: 'Voltage Rating', value: '120', uom: 'V', confidence: 98, status: 'Verified' },
      { id: 'b3', name: 'Amperage Rating', value: '10', uom: 'A', confidence: 98, status: 'Verified' },
      { id: 'b4', name: 'Mounting Type', value: 'Built-in', confidence: 98, status: 'Verified' },
      { id: 'b5', name: 'Size', value: '33-7/16 in H x 23-7/8 in W x 22-5/8 in D', confidence: 98, status: 'Verified' },
      { id: 'b6', name: 'Depth With Door Open', value: '50-3/16', uom: 'in', confidence: 98, status: 'Verified' },
      { id: 'b7', name: 'Minimum Height', value: '33-7/16', uom: 'in', confidence: 98, status: 'Verified' },
      { id: 'b8', name: 'Sound Level', value: '41', uom: 'dBA', confidence: 98, status: 'Verified' },
      { id: 'b9', name: 'Material', value: 'Stainless Steel', confidence: 98, status: 'Verified' }
    ]
  }
];
