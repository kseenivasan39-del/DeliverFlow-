# Confidence Model

## Goal

Assign a numerical confidence score (0.0–1.0) to each extracted attribute value
that reflects how trustworthy the value is, based on:

1. **Source quality** — Where did the value come from?
2. **Extraction clarity** — How clearly was the value stated in the text?
3. **Source agreement** — Do multiple independent sources agree?

---

## Source Reliability Weights

These weights are fixed constants, not learned values.
They encode domain knowledge about source authority.

| Source Type | Weight | Rationale |
|---|---|---|
| `manufacturer_datasheet` | **1.00** | Primary specification document; highest authority |
| `official_product_page` | **0.90** | Manufacturer-controlled; often less detailed than datasheet |
| `authorized_distributor` | **0.80** | Vetted channel; data typically accurate but may lag revisions |
| `distributor_page` | **0.60** | Unvetted; may contain copy errors or outdated data |
| `marketplace_listing` | **0.40** | Lowest authority; high rate of transcription errors and rounding |

---

## Extraction Clarity Score

Assigned by the LLM during attribute extraction, on a 0.0–1.0 scale:

| Score | Meaning |
|---|---|
| 1.0 | Value explicitly stated in a structured field (table row, label:value pair) |
| 0.8–0.9 | Value clearly stated in prose or bullet point |
| 0.5–0.7 | Value inferred from context or MPN suffix |
| 0.2–0.4 | Value guessed from indirect evidence |
| 0.0 | Unable to extract; no candidate produced |

---

## Per-Candidate Score

```
candidate_score = source_reliability_weight × extraction_clarity_score
```

**Example:**
- Source: `manufacturer_datasheet` (weight = 1.0)
- Extraction clarity: 0.97 (found in specifications table)
- Candidate score: **0.97**

---

## Attribute Confidence Score

When multiple candidates exist for an attribute:

```
# Step 1: Weighted average of candidate scores
base_score = sum(candidate_score_i) / n

# Step 2: Agreement bonus — if all values normalize to the same value
if all_candidates_agree:
    agreement_bonus = 0.05 × min(n - 1, 3)   # up to +0.15
else:
    agreement_bonus = 0

# Step 3: Single-source penalty
if n == 1:
    single_source_penalty = 0.05
else:
    single_source_penalty = 0

# Final score
confidence = clamp(base_score + agreement_bonus - single_source_penalty, 0.0, 1.0)
```

---

## Status Thresholds

| Condition | Status |
|---|---|
| `confidence >= threshold` AND all candidates agree | `verified` |
| `confidence >= threshold` AND candidates disagree | `conflict` |
| `confidence < threshold` AND n >= 2 AND candidates disagree | `conflict` |
| `confidence < threshold` AND n == 1 | `low_confidence` |
| No valid candidates extracted | `missing` |

Default `confidence_threshold`: **0.75** (configurable per enrichment run via `EnrichRequest.confidence_threshold`).

---

## Review Routing

After confidence scoring, the pipeline flags attributes for human review if:

- Status is `conflict`
- Status is `low_confidence`
- Status is `missing` (reviewer may enter value manually via `edit` action)

Attributes with `verified` status are NOT routed to review unless the reviewer
explicitly triggers a re-enrichment with `force: true`.

---

## Example Walk-Through

**Attribute:** `pressure` for product `GV-4800-CS-FL`

| Candidate | Source Type | Reliability | Clarity | Score |
|---|---|---|---|---|
| `285 PSI` | `manufacturer_datasheet` | 1.00 | 1.00 | **1.00** |
| `300 PSI` | `authorized_distributor` | 0.80 | 0.80 | **0.64** |

```
base_score       = (1.00 + 0.64) / 2 = 0.82
agreement_bonus  = 0  (candidates disagree)
penalty          = 0  (n = 2)
confidence       = 0.82
status           = conflict  (candidates disagree, confidence ≥ threshold but values differ)
```

Result: Attribute flagged for human review. Reviewer sees both candidates and
chooses to accept `285 PSI` citing the ANSI Class 150 standard.
