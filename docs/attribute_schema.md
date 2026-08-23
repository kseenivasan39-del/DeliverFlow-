# Attribute Schema

## Design Principles

1. **Canonical names** — All attributes use `snake_case` identifiers. These are the
   only names the API accepts and emits. Frontend display labels are a UI concern.
2. **String values** — All attribute values are stored as normalized strings.
   Unit parsing and numeric comparisons are done at validation time, but the
   canonical representation remains a human-readable string.
3. **Fixed set for MVP** — The attribute enum is fixed for the industrial valve demo.
   Extension points exist in the schema (`additionalProperties` on export) for future categories.

---

## Attribute Reference

### `category`

| Property | Value |
|---|---|
| Type | `string` |
| Example | `"Ball Valve"` |
| Validation | Must match known valve types: Ball, Gate, Globe, Check, Butterfly, Needle, Plug |
| Notes | Extracted from product family heading, breadcrumb, or page title |

---

### `material`

| Property | Value |
|---|---|
| Type | `string` |
| Example | `"316 Stainless Steel"` |
| Validation | Must reference a known material keyword (Steel, Brass, Bronze, Cast Iron, PVC, CPVC, PTFE...) |
| Notes | Common source ambiguity: "SS" → expanded to "Stainless Steel"; grade (316, 304) preserved if present |

---

### `pressure`

| Property | Value |
|---|---|
| Type | `string` |
| Example | `"1000 PSI"` |
| Validation | Must contain a numeric value and one of: PSI, bar, MPa, kPa |
| Normalization | Values in bar/MPa are stored as-is; PSI is the canonical demo unit |
| Notes | Often sourced from pressure-temperature rating tables; prefer 100°F/38°C baseline row |

---

### `connection`

| Property | Value |
|---|---|
| Type | `string` |
| Example | `"NPT 1/2\""` |
| Validation | Must reference a known connection type |
| Known types | NPT, BSP, BSPT, Flanged (ANSI/ASME Class 150/300/600/900), Socket Weld (SW), Butt Weld (BW), Tri-Clamp, Push-to-Connect |
| Notes | Size is included in the value string when available |

---

### `temperature_range`

| Property | Value |
|---|---|
| Type | `string` |
| Example | `"-20°C to 180°C"` |
| Validation | Must contain two temperature values with a separator (to, –, ~) and a unit (°C or °F) |
| Normalization | Values in °F are noted in `extraction_note`; stored in original unit, °C preferred for canonical form |
| Notes | Sources may list °C and °F interchangeably; verify equivalence during conflict resolution |

---

### `description`

| Property | Value |
|---|---|
| Type | `string` |
| Example | `"Full-port, 2-piece 316 SS ball valve with 1/2\" NPT connections..."` |
| Validation | Minimum 20 characters; must not be a URL or a code/SKU |
| Notes | LLM-synthesized from product overview text. Scored lower than structured attributes due to subjective extraction. |

---

## Status Lifecycle

```
                   ┌─────────────┐
                   │  extracted  │
                   └──────┬──────┘
                          │
            ┌─────────────┼─────────────┐
            ▼             ▼             ▼
       verified     low_confidence   conflict
            │             │             │
            └──────────┬──┘             │
                       ▼               │
                  needs_review ◀────────┘
                   (if flagged)
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       accepted      edited      rejected
```

`missing` is a terminal state unless a new enrichment run is triggered.
`unknown` is used for edge cases where the pipeline could not determine a state.
