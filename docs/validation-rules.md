# DeliverFlow — Validation Rules Reference

> **Audience:** Frontend engineers, backend implementers, and hackathon judges.
> This document explains the rules engine and walks through all three demo scenarios.

---

## Overview

The DeliverFlow rules engine sits between AI extraction and the final product record.
It makes every status decision deterministic, explainable, and auditable.

**The rule:**  The AI extracts. The rules engine decides.

No status value (`verified`, `conflict`, `missing`) is set by the AI model.
All status decisions are made by the rules in `shared/rules/`.

---

## Source Authority

Before any attribute is scored, the source it came from is weighted.

| Source Type | Authority Score | Trust Label | Confidence Bonus |
|---|---|---|---|
| `manufacturer_datasheet` | 1.00 | Very High | +20 pts |
| `official_product_page` | 0.90 | High | +18 pts |
| `authorized_distributor` | 0.80 | Medium-High | +16 pts |
| `distributor_page` | 0.60 | Medium | +12 pts |
| `marketplace_listing` | 0.40 | Low | +8 pts |

**Why this matters for the demo:** When a distributor page says 16 bar and the
manufacturer datasheet says 10 bar, the rules engine sees a 0.60 vs 1.00 authority
difference — but it does **not** auto-resolve to the datasheet. It flags a conflict and
routes to human review, because the rules state: *never silently resolve a material conflict*.

---

## Confidence Scoring

```
confidence = clamp(round(
    model_confidence          ← 0–70  (how clearly was the value stated?)
  + source_authority_bonus    ← 0–20  (authority_score × 20)
  + evidence_quality_bonus    ← up to +15
  + agreement_bonus           ← up to +6  (+3 per additional agreeing source)
  - conflict_penalty          ← −25 if conflict detected
  - ambiguity_penalty         ← −10 to −15 for vague or family-level evidence
), 0, 99)
```

### Evidence Quality Signals

| Signal | Points |
|---|---|
| Value in structured spec table | +8 |
| Exact MPN in source URL/title | +5 |
| Material stated with grade (e.g. CF8M) | +5 |
| Value from "Specifications" section | +2 |
| Source covers a product series, not this MPN | −5 |
| Value has no unit | −3 |

### Score → Status

| Score | Status | Meaning |
|---|---|---|
| 85–99 | `verified` | High confidence, ready for export |
| 60–84 | `needs_review` | Reasonable but human confirmation needed |
| 0–59 | `low_confidence` | Weak evidence, single source, or inference only |
| any | `conflict` *(override)* | Rule fired — two sources materially disagree |
| any | `missing` *(override)* | No non-null candidate found |

---

## Attribute Validation Rules

### `category`

- **Validation:** Must match a known valve type after keyword normalization.
- **Normalization:** `"ball valve"`, `"2-piece ball valve"` → `"Ball Valve"`.
- **Conflict:** Fires if two sources normalize to different valve types.
- **Demo:** Strong match from datasheet → `verified`.

### `material`

- **Validation:** Must reference a known material family.
- **Normalization:** `"316 SS"`, `"CF8M"`, `"AISI 316"` → `"316 Stainless Steel"`.
- **Grade ambiguity rule:**
  - Source says `"Stainless Steel"` with no grade → `low_confidence`.
  - Source says `"316 Stainless Steel"` or `"CF8M"` → grade-specific, eligible for `verified`.
  - Source A says `"316 SS"`, Source B says `"304 SS"` → `conflict` (grade_mismatch, severity: high).
- **Key rule:** The system will never upgrade `"Stainless Steel"` to `"316 Stainless Steel"` by assumption.

### `pressure`

- **Validation:** Must contain a numeric value AND a unit (bar, PSI, MPa, kPa).
- **Normalization:** All units stored internally as `bar` for comparison; display uses original unit.
- **Plausibility:** Must be between 0.1 bar and 1000 bar.
- **Baseline:** If a P-T table is present, use the 20°C row (ambient baseline).
- **Conflict rule:**
  - Difference > 5% after normalization → `conflict` (genuine_conflict or data_entry_error).
  - Difference ≤ 5% → `minor_variance`, auto-resolved to higher-authority source.

### `connection`

- **Validation:** Must match a known connection type (NPT, BSP, Flanged, SW, BW, ISO 5211, Tri-Clamp).
- **Normalization:** Size fractions standardized (e.g., `1/2 in NPT` → `1/2" NPT`).
- **Conflict rule:** Size mismatch (`1/2 NPT` vs `3/4 NPT`) or type mismatch (`NPT` vs `BSP`) → `conflict`.
- **Ambiguity:** If source says only "threaded" with no size or standard → `low_confidence`.

### `temperature_range`

- **Validation:** Must contain both a min and max temperature with a unit.
- **Normalization:** Canonical unit is °C; °F and K converted for comparison.
- **Missing boundary rule:** If only min or max found → `low_confidence` (not `missing`).
- **Redacted field rule:** If source text contains `REDACTED`, `PENDING`, or `TBD` in the temperature field → `missing`. **The system never invents a temperature range.**
- **Conflict rule:** Min or max differ by more than 5°C between sources → `conflict`.
- **Partial vs. complete:** Complete range from higher-authority source preferred; not a conflict.

### `description`

- **Generation:** Synthesized by `description_generator.v1` prompt from verified attributes only.
- **Guard:** If fewer than 2 verified attributes are available → `missing`. No partial description generated.
- **Style rules:** No marketing language. 15–80 words. Technical, factual, catalog-ready.
- **Conflict:** Not applicable — description is not extracted from multiple sources.

---

## Product-Level Confidence

Weighted average of all attribute confidence scores.

| Attribute | Weight |
|---|---|
| `pressure` | 25% |
| `material` | 20% |
| `temperature_range` | 20% |
| `connection` | 15% |
| `category` | 10% |
| `description` | 10% |

Missing attributes score 0 but their weight still counts in the denominator,
penalizing the total.

### Automatic Caps

| Condition | Cap | Product Status |
|---|---|---|
| Any `pressure`, `material`, or `temperature_range` is `conflict` | 70 | `needs_review` |
| Any `pressure`, `material`, or `temperature_range` is `missing` | 65 | `needs_review` |
| All attributes verified and score ≥ 85 | none | `ready` |

---

## Demo Scenarios

### Scenario 1 — Clean Verified Product: `VAL-316-100`

**MPN:** VAL-316-100 | **Brand:** Acme Industrial

**Sources:** Manufacturer datasheet (authority 1.0), official product page (0.90), authorized distributor (0.82).

| Attribute | Value | Evidence | Confidence | Status |
|---|---|---|---|---|
| `category` | Ball Valve | 2 agreeing sources | 98 | `verified` |
| `material` | 316 Stainless Steel | Datasheet: "CF8M (316 SS)" — grade explicit | 97 | `verified` |
| `pressure` | 16 bar | 3 agreeing sources — P-T table, product page, distributor | 99 | `verified` |
| `connection` | ISO 5211 F05 | 2 agreeing sources | 95 | `verified` |
| `temperature_range` | -20°C to +200°C | 2 agreeing sources | 96 | `verified` |
| `description` | *(synthesized)* | From verified attributes above | 91 | `verified` |

**Confidence calculation (pressure example):**

```
model_confidence     = 70  (explicit structured field: P-T table row at 20°C)
source_authority     = 20  (manufacturer_datasheet, score 1.0)
evidence_quality     = 13  (direct_numeric +8, exact_mpn +5)
agreement_bonus      = +6  (3 additional agreeing sources → max)
conflict_penalty     = 0
ambiguity_penalty    = 0
─────────────────────────
raw                  = 109
confidence           = clamp(109, 0, 99) = 99
status               = verified (≥85)
```

**Product confidence:**
```
(99×0.25) + (97×0.20) + (96×0.20) + (95×0.15) + (98×0.10) + (91×0.10)
= 24.75 + 19.40 + 19.20 + 14.25 + 9.80 + 9.10
= 96.5 → rounded to 97
```

**Product status:** `ready` ✅ — All high-criticality attributes verified. Score ≥ 85. No caps applied.

---

### Scenario 2 — Conflict Product: `VAL-316-100-C`

**MPN:** VAL-316-100-C | **Brand:** Acme Industrial

**Sources:** Manufacturer datasheet (1.0), official product page (0.90), ProLine Industrial distributor page (0.58).

**The conflict:** ProLine Industrial lists `pressure = 16 bar`. Both the manufacturer datasheet
and official product page specify `pressure = 10 bar`. This is an ASME Class 150 product —
16 bar corresponds to PN16 (Class 300), a different pressure class.

**Conflict detection rule applied:**

```yaml
- name: pressure_class_mismatch
  condition: one value consistent with ASME Class 150 (~10 bar) AND
             another consistent with PN16 (16 bar)
  conflict_type: data_entry_error
  severity: high
  action: set_status_conflict
```

**Confidence calculation (pressure attribute):**

```
model_confidence     = 70  (explicit P-T table from datasheet)
source_authority     = 20  (datasheet, score 1.0)
evidence_quality     = 13
agreement_bonus      = +3  (official_product_page also says 10 bar)
conflict_penalty     = -25 (distributor_page says 16 bar — rule fired)
─────────────────────────
raw                  = 81
confidence           = 81  → but status = conflict (rule override)
```

> The numeric score (81) would normally suggest `needs_review`. But conflict is an override —
> once the conflict rule fires, `status = conflict` regardless of score.

**Product confidence cap:**

```
pressure is conflict → high_criticality attribute in conflict
→ product confidence capped at 70
→ product_status = needs_review
```

**Review UI behavior:**

The reviewer sees:

| Source | Value | Authority | Likely Correct? |
|---|---|---|---|
| Manufacturer Datasheet | 10 bar | Very High | ✅ Yes — ASME Class 150 |
| Official Product Page | 10 bar | High | ✅ Confirms datasheet |
| ProLine Industrial | 16 bar | Medium | ⚠️ Data-entry error — Class 300 value |

The reviewer can: **Accept** (10 bar), **Edit** (custom value), **Reject** (discard), or **Mark Unknown**.

Once all `needs_review` attributes are actioned, product status recalculates.

---

### Scenario 3 — Missing Evidence Product: `VAL-316-100-M`

**MPN:** VAL-316-100-M | **Brand:** Acme Industrial

**Sources:** Manufacturer datasheet Rev. A (1.0 — but temperature section redacted), TechParts Direct distributor page (0.55 — no specs at all).

**The missing attribute:** `temperature_range`

**What the datasheet says:**
```
Temperature Range: [REDACTED — PENDING CRYOGENIC CERT UPDATE]
```

**Validation rule applied:**

```yaml
- rule: redacted_field
  condition: source text contains 'REDACTED', 'PENDING', 'TBD', 'N/A' in temperature field
  action: set_value_null_and_status_missing
```

**Result:**
- `temperature_range.value = null`
- `temperature_range.status = missing`
- No candidate is generated for temperature_range
- **The system does not invent a value, infer from MPN, or estimate from the material type.**

**Other attributes:** `category` and `description` are also `missing` because the
manufacturer product page returned 404 and the distributor listing has no spec data.
`pressure`, `material`, and `connection` are `low_confidence` from the partial datasheet.

**Product confidence cap:**

```
temperature_range is missing → high_criticality attribute missing
→ product confidence capped at 65
→ product_status = needs_review
```

**Review UI behavior:**

The reviewer sees `temperature_range` with status `missing`, value `—`, and
a pipeline note explaining why:

> *"Temperature section in manufacturer datasheet (DS-VAL-316-100-M-RevA) is explicitly
> marked '[REDACTED — PENDING CRYOGENIC CERT UPDATE]'. No other sources contain temperature data.
> Contact Acme Industrial Product Engineering for interim specifications."*

The reviewer can **Edit** (enter the known temperature range manually) or **Mark Unknown**.

---

## Status Machine Summary

```
ATTRIBUTE STATUS FLOW

null ──extraction──▶  verified        (conf ≥ 85, no conflict)
                 ▶  low_confidence   (conf < 85, no conflict, has value)
                 ▶  conflict         (conflict rule fired)
                 ▶  missing          (all candidates null)

[low_confidence │ conflict │ missing] ──prepare──▶  needs_review

needs_review ──reviewer──▶  accepted   (accepted as-is)
                        ▶  edited     (reviewer corrected)
                        ▶  rejected   (discarded; treated as missing)
                        ▶  unknown    (cannot determine)
```

```
PRODUCT STATUS FLOW

created ──enrich──▶ discovering_sources
                ──▶ retrieving_evidence
                ──▶ extracting_attributes
                ──▶ validating_values
                ──▶ assigning_confidence
                ──▶ ready           (all verified, score ≥ 85)
                ──▶ needs_review    (any conflict / missing / low score)
                ──▶ failed          (unrecoverable pipeline error)

needs_review ──all reviewed──▶ ready
```

---

## Rule Files Reference

| File | Contents |
|---|---|
| [`shared/rules/source_authority.yaml`](../shared/rules/source_authority.yaml) | Trust weights per source type |
| [`shared/rules/validation.yaml`](../shared/rules/validation.yaml) | Per-attribute validation and conflict detection |
| [`shared/rules/confidence.yaml`](../shared/rules/confidence.yaml) | Scoring formula, thresholds, criticality, caps |
| [`shared/rules/status_machine.yaml`](../shared/rules/status_machine.yaml) | State definitions and legal transitions |
