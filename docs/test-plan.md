# DeliverFlow — Test Plan

> **Scope:** Hackathon MVP demo — industrial valve enrichment pipeline.
> **Goal:** Guarantee the demo works end-to-end without a live AI call, and that all three demo scenarios behave exactly as expected.

---

## 1. Test Strategy

The demo must survive three failure modes:

| Risk | Mitigation |
|---|---|
| Gemini API down or rate-limited | `AI_MODE=mock` loads fixtures; demo never calls LLM |
| Backend not started | Frontend MSW handlers serve all fixtures in-browser |
| Wrong fixture data | Golden tests (`golden-tests.json`) validate every assertion |

We run tests at three levels, all fast enough for a pre-demo check (<60 seconds total).

---

## 2. Test Levels

### Level 1 — Unit Tests (backend, pure functions)

**File:** `backend/tests/test_enrichment.py`
**Runner:** `pytest -v`
**Speed:** < 5 seconds

Tests the trust gate and conflict detection in complete isolation — no LLM, no I/O.

| Test | What it verifies |
|---|---|
| `test_marketplace_single_source_below_verified_threshold` | Single low-authority source cannot reach 'verified' |
| `test_datasheet_structured_field_high_confidence` | Manufacturer datasheet scores ≥ 85 |
| `test_null_candidate_produces_missing_status` | All-null candidates → MISSING, never LOW_CONFIDENCE |
| `test_conflict_overrides_high_score_to_conflict_status` | Status override wins over numeric score |
| `test_pressure_conflict_above_5pct` | 10 bar vs 16 bar → conflict, severity HIGH |
| `test_pressure_no_conflict_within_5pct` | 10 bar vs 10.2 bar → no conflict |
| `test_material_grade_conflict` | 316 SS vs 304 SS → grade_mismatch conflict |
| `test_material_vague_vs_specific_no_conflict` | "Stainless Steel" vs "316 SS" → ambiguity, not conflict |
| `test_connection_type_mismatch_is_conflict` | NPT vs BSP → genuine conflict |
| `test_single_candidate_never_conflicts` | One candidate cannot conflict with itself |
| `test_null_candidate_ignored_in_conflict` | Null candidates excluded from conflict check |

### Level 2 — Integration Tests (backend, with fixtures)

**File:** `backend/tests/test_enrichment.py`
**Runner:** `pytest -v`
**Speed:** < 3 seconds

Tests the full extraction function in mock mode and the fallback chain in live mode.

| Test | Golden Ref | What it verifies |
|---|---|---|
| `TestCleanVerifiedProduct` | GT-001 | Fixture loads, all attrs verified, confidence ≥ 90, 0 warnings |
| `TestConflictProduct` | GT-002 | Pressure is CONFLICT, confidence ≤ 70, warning code ATTRIBUTE_CONFLICT |
| `TestMissingEvidenceProduct` | GT-003 | temperature_range is null, status MISSING, no hallucination |
| `test_mock_mode_returns_fixture_without_calling_gemini` | GT-008 | `_call_gemini` never called in mock mode |
| `test_live_mode_retries_twice_then_falls_back` | GT-009 | Two failures → fixture, gemini called exactly 2× |
| `TestProductConfidence` | — | Caps: conflict → ≤70, missing high-crit → ≤65, all-verified → ready |

### Level 3 — Frontend Scenario Tests (MSW mock mode)

**File:** `frontend/mocks/test-scenarios.ts`
**Runner:** Vitest or Playwright (with `NEXT_PUBLIC_API_MODE=mock`)
**Speed:** < 15 seconds

Each `TestScenario` has structured `assertions` for programmatic checking and human-readable `steps` for manual verification.

| Scenario | ID | Key assertions |
|---|---|---|
| Clean verified product | TS-001 | All 6 attrs verified, confidence ≥ 90, no warnings, export enabled |
| Conflict product | TS-002 | Pressure = CONFLICT, confidence ≤ 70, conflict panel shows both values |
| Missing evidence | TS-003 | temperature_range value is null, no inferred value rendered anywhere |

---

## 3. Pre-Demo Smoke Check

Run this sequence before presenting. Total time: < 2 minutes.

```bash
# 1. Backend unit + integration tests
cd backend
AI_MODE=mock pytest tests/test_enrichment.py -v --tb=short

# 2. Start backend in mock mode
AI_MODE=mock uvicorn app.main:app --reload --port 8000 &

# 3. Start frontend in mock mode
cd frontend
NEXT_PUBLIC_API_MODE=mock npm run dev &

# 4. Manual browser smoke test (30 seconds)
#    Open http://localhost:3000
#    Enter VAL-316-100 → Enrich → verify "Ready" badge and confidence ≥ 90
#    Enter VAL-316-100-C → Enrich → verify conflict warning on pressure
#    Enter VAL-316-100-M → Enrich → verify temperature_range shows "Missing" with null value
```

---

## 4. Demo Scenario Checklist

### Scenario 1 — Clean Verified Product (`VAL-316-100`)

- [ ] Status badge: **Ready** (green)
- [ ] Overall confidence: ≥ 90
- [ ] All 6 attribute rows show **Verified** status (green checkmark)
- [ ] Pressure row shows ≥ 2 source agreement indicators
- [ ] No warning banner visible
- [ ] Export JSON → download triggers
- [ ] Export CSV → download triggers
- [ ] Evidence Viewer shows 3 tabs (Datasheet, Product Page, Distributor)

### Scenario 2 — Conflict Product (`VAL-316-100-C`)

- [ ] Status badge: **Needs Review** (amber)
- [ ] Overall confidence: ≤ 70
- [ ] Warning banner: mentions pressure conflict
- [ ] Pressure attribute row: **Conflict** badge (red)
- [ ] Conflict panel expands: shows 10 bar (Manufacturer, auth 1.0) and 16 bar (ProLine, auth 0.58)
- [ ] Conflict summary mentions "Class 150" and "PN16"
- [ ] Click **Accept** on 10 bar → pressure status changes to **Accepted**
- [ ] Product status transitions to **Ready** after all review actions submitted
- [ ] Export buttons become enabled

### Scenario 3 — Missing Evidence Product (`VAL-316-100-M`)

- [ ] Status badge: **Needs Review** (amber)
- [ ] Overall confidence: ≤ 65
- [ ] Temperature range row: **Missing** badge (grey) — value cell shows `—`
- [ ] Temperature range row: reason text mentions "REDACTED"
- [ ] Description row: **Missing** badge — reason: insufficient verified attributes
- [ ] **NO temperature value is shown or inferred anywhere in the UI**
- [ ] Evidence Viewer → Datasheet tab shows `[REDACTED — PENDING CRYOGENIC CERT UPDATE]`
- [ ] Click **Edit** on temperature_range → input field appears
- [ ] Enter corrected value → status changes to **Edited**

---

## 5. Failure Modes and Fallback Behaviour

| Failure | Expected behaviour | How to verify |
|---|---|---|
| `GEMINI_API_KEY` missing | Returns fixture, `from_fallback: true` | Check response JSON field |
| LLM returns invalid JSON | Retries once, then fixture | Check logs: "Both LLM attempts failed" |
| LLM returns hallucinated temperature | Trust gate sets `value=null`, `status=missing` | GT-003 assertion |
| Backend not reachable | MSW serves fixture in browser | Switch to `NEXT_PUBLIC_API_MODE=mock` |
| Fixture file missing | `failed_result()` returned with `pipeline_status: failed` | Logs: "No fixture for MPN" |

---

## 6. Golden Test Reference

All numeric assertions derive from `shared/demo-data/golden-tests.json`.

| ID | Scenario | Key assertion |
|---|---|---|
| GT-001 | Clean verified | `pipeline_status=ready`, `confidence ≥ 90`, `warnings=0` |
| GT-002 | Conflict | `pressure.status=conflict`, `confidence ≤ 70`, warning code `ATTRIBUTE_CONFLICT` |
| GT-003 | Missing | `temperature_range.value=null`, `confidence=null`, `candidates=0` |
| GT-004 | Unit | Single marketplace source scores < 85 |
| GT-005 | Unit | 10 bar vs 16 bar → `has_conflict=true` |
| GT-006 | Unit | 10 bar vs 10.2 bar → `has_conflict=false` |
| GT-007 | Unit | All-null candidates → `status=missing` |
| GT-008 | Integration | `AI_MODE=mock` → 0 Gemini calls |
| GT-009 | Integration | Two LLM failures → `from_fallback=true`, 2 calls |
| GT-010 | API | Export on incomplete pipeline → HTTP 409 |

---

## 7. Out of Scope

These are explicitly **not tested** for the hackathon:

- Authentication and authorization
- Multi-tenant isolation
- Real web scraping (sources are fixtures)
- Production load / concurrent users
- Browser compatibility beyond latest Chrome
- Mobile responsiveness of the review UI
