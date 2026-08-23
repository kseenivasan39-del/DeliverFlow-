# DeliverFlow

> AI-powered product intelligence for industrial commerce.

DeliverFlow ingests a Manufacturer Part Number (MPN), brand, and short description, then autonomously discovers sources, retrieves evidence, extracts structured attributes using AI, validates values, assigns confidence scores, and routes ambiguous data to human review — producing a verified, exportable product record.

---

## Demo Category

**Industrial Valves** — ball valves, gate valves, butterfly valves, needle valves.

---

## Architecture (Hackathon Scale)

```
┌─────────────────────────────────────────────────────┐
│                    DeliverFlow                      │
│                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐  │
│  │ Frontend │───▶│  API     │───▶│  Pipeline    │  │
│  │ (Next.js)│    │ (FastAPI)│    │  (Python)    │  │
│  └──────────┘    └──────────┘    └──────────────┘  │
│                       │                  │          │
│                  ┌────┴────┐    ┌────────┴───────┐  │
│                  │ SQLite  │    │  OpenAI / LLM  │  │
│                  │  (DB)   │    │  (Extraction)  │  │
│                  └─────────┘    └────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Pipeline Steps (in order)

| Step | Description |
|------|-------------|
| `discovering_sources` | Search for datasheets, product pages, distributor listings |
| `retrieving_evidence` | Fetch and parse raw text from discovered URLs |
| `extracting_attributes` | LLM extracts structured attributes from evidence |
| `validating_values` | Rule-based validation against known ranges and formats |
| `assigning_confidence` | Score each attribute based on source quality and agreement |
| `preparing_product_record` | Assemble final record; flag low-confidence for review |

---

## Repository Structure

```
deliverflow/
├── README.md                        ← You are here
│
├── contracts/                       ← API contract (source of truth)
│   ├── openapi.yaml                 ← OpenAPI 3.1 specification
│   └── examples/
│       ├── product_verified.json    ← Clean verified product
│       ├── product_conflict.json    ← Conflicting attribute values
│       └── product_missing.json     ← Missing evidence product
│
├── packages/
│   ├── api/                         ← FastAPI backend
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── products.py
│   │   │   ├── enrich.py
│   │   │   ├── evidence.py
│   │   │   ├── review.py
│   │   │   └── export.py
│   │   ├── services/
│   │   │   ├── pipeline.py          ← Orchestrates enrichment steps
│   │   │   ├── source_discovery.py
│   │   │   ├── evidence_retrieval.py
│   │   │   ├── attribute_extraction.py
│   │   │   ├── value_validation.py
│   │   │   └── confidence.py
│   │   ├── models/
│   │   │   ├── product.py
│   │   │   ├── source.py
│   │   │   ├── evidence.py
│   │   │   ├── attribute.py
│   │   │   └── review.py
│   │   ├── db/
│   │   │   └── database.py
│   │   └── requirements.txt
│   │
│   └── web/                         ← Next.js frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx          ← MPN input + pipeline status
│       │   │   ├── products/[id]/
│       │   │   │   ├── page.tsx      ← Product detail
│       │   │   │   ├── review/page.tsx ← Human review queue
│       │   │   │   └── export/page.tsx
│       │   ├── components/
│       │   │   ├── PipelineStatus.tsx
│       │   │   ├── AttributeCard.tsx
│       │   │   ├── EvidencePanel.tsx
│       │   │   ├── ReviewForm.tsx
│       │   │   └── ExportButtons.tsx
│       │   └── lib/
│       │       ├── api.ts            ← Typed API client (from OpenAPI)
│       │       └── types.ts          ← Generated from contract
│       └── package.json
│
├── scripts/
│   ├── seed_demo.py                  ← Seeds DB with valve demo data
│   └── validate_contract.sh         ← Runs spectral lint on openapi.yaml
│
└── docs/
    ├── pipeline.md                   ← Pipeline design decisions
    ├── attribute_schema.md           ← Attribute naming rationale
    └── confidence_model.md          ← How confidence scores are computed
```

---

## Quickstart

```bash
# 1. Install backend
cd packages/api
pip install -r requirements.txt

# 2. Seed demo data
python ../../scripts/seed_demo.py

# 3. Start API
uvicorn main:app --reload --port 8000

# 4. Install frontend
cd ../web
npm install
npm run dev
```

API docs auto-generated at: `http://localhost:8000/docs`

---

## Contract-First Development

The `contracts/openapi.yaml` is the **single source of truth**.

- Backend validates against it via `fastapi` response models
- Frontend generates types via `openapi-typescript`
- Never change an endpoint without updating the contract first

---

## Attribute Names

| Attribute | Type | Example |
|-----------|------|---------|
| `category` | string | `"Ball Valve"` |
| `material` | string | `"316 Stainless Steel"` |
| `pressure` | string | `"1000 PSI"` |
| `connection` | string | `"NPT 1/2\""` |
| `temperature_range` | string | `"-20°C to 180°C"` |
| `description` | string | `"Full port, 2-piece design..."` |

---

## Attribute Statuses

| Status | Meaning |
|--------|---------|
| `verified` | High confidence, multiple sources agree |
| `low_confidence` | Single source, uncertain extraction |
| `conflict` | Multiple sources disagree |
| `missing` | No evidence found |
| `needs_review` | Flagged for human review |
| `accepted` | Human accepted the value |
| `edited` | Human edited the value |
| `rejected` | Human rejected; value discarded |
| `unknown` | Status cannot be determined |
