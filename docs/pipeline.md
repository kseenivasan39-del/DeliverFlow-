# Pipeline Design

## Overview

The DeliverFlow enrichment pipeline is a six-step, linear chain that processes
a product from an MPN stub to a verified, exportable record.

Each step is idempotent and produces persisted output that the next step consumes.
The pipeline can be paused between steps (e.g., for rate limiting or async tasks)
without data loss.

---

## Steps

### 1. `discovering_sources`

**Goal:** Find URLs likely to contain product data for this MPN.

**Inputs:** `mpn`, `brand`, `description`

**Process:**
- Construct search queries: `"{brand} {mpn} datasheet"`, `"{mpn} specifications"`, etc.
- Rank results by `SourceType` priority:
  1. `manufacturer_datasheet`
  2. `official_product_page`
  3. `authorized_distributor`
  4. `distributor_page`
  5. `marketplace_listing`
- Deduplicate by domain; cap at 6 sources for hackathon scale.

**Output:** List of `Source` records stored in DB.

---

### 2. `retrieving_evidence`

**Goal:** Fetch and parse raw text from each discovered source.

**Inputs:** `Source` list from step 1.

**Process:**
- HTTP GET each URL with a reasonable timeout (5s).
- Extract text via HTML parsing (BeautifulSoup / Trafilatura).
- Store raw text as `Evidence` records.
- Record `extraction_error` if a source is inaccessible; do not fail the pipeline.

**Output:** List of `Evidence` records stored in DB.

---

### 3. `extracting_attributes`

**Goal:** Extract structured attribute values from evidence text using LLM.

**Inputs:** All `Evidence` records for this product.

**Prompt strategy:**
- Per evidence: `"Given the following product page text, extract these attributes: category, material, pressure, connection, temperature_range, description. Return JSON only."`
- One LLM call per evidence record (parallel where possible).
- Use structured output / function calling for reliability.

**Output:** `CandidateValue` records attached to each `Attribute`.

---

### 4. `validating_values`

**Goal:** Apply rule-based validation to extracted candidate values.

**Rules (examples):**
- `pressure`: Must contain a number and a unit (PSI, bar, MPa).
- `temperature_range`: Must contain two temperatures with a "to" or "–" separator.
- `connection`: Must reference a known connection type (NPT, BSP, Flanged, SW, BW, etc.).
- `material`: Must match a known material pattern; reject values like "See Datasheet".

**Output:** Candidates marked as `valid` or `invalid`; invalid candidates excluded from confidence scoring.

---

### 5. `assigning_confidence`

**Goal:** Compute a confidence score for each attribute and determine its status.

**Formula:**

```
candidate_score = source_reliability_weight × extraction_clarity_score

attribute_confidence = weighted_average(candidate_scores)
                       boosted by: source_agreement_bonus
                       penalized by: source_count < 2
```

**Source reliability weights:**
| Source Type | Weight |
|---|---|
| `manufacturer_datasheet` | 1.0 |
| `official_product_page` | 0.90 |
| `authorized_distributor` | 0.80 |
| `distributor_page` | 0.60 |
| `marketplace_listing` | 0.40 |

**Status assignment:**
| Condition | Status |
|---|---|
| confidence ≥ threshold AND all candidates agree | `verified` |
| confidence < threshold AND single source | `low_confidence` |
| Multiple candidates with different values | `conflict` |
| No valid candidates | `missing` |

---

### 6. `preparing_product_record`

**Goal:** Assemble final product record; flag attributes for human review.

**Process:**
- Set `attribute.value` to the highest-confidence candidate value.
- Flag attributes with status `conflict`, `low_confidence`, or `missing` as `needs_review`.
- Increment `product.needs_review_count`.
- Set `pipeline_status`:
  - `completed` if `needs_review_count == 0`
  - `needs_review` if `needs_review_count > 0`

**Output:** Updated `Product` record ready for export or human review.

---

## Error Handling

| Error | Behavior |
|---|---|
| Source unreachable | Log `extraction_error`, continue with remaining sources |
| LLM timeout | Retry once; mark attribute as `missing` if second attempt fails |
| All sources fail | Set `pipeline_status: failed`, preserve partial data |
| Validation all candidates invalid | Mark attribute `missing` |

---

## Hackathon Simplifications

- Pipeline runs **synchronously** in a background thread (no Celery/Redis needed).
- Poll `GET /products/{id}` for status updates.
- LLM extraction uses a single OpenAI GPT-4o call per evidence record.
- Source discovery is mocked for demo — real implementation would use SerpAPI or similar.
