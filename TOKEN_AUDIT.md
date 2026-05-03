# Token System Audit: 3-Tier → 2-Tier Migration

**Date**: May 3, 2026  
**Goal**: Identify redundant Tier 2 → Tier 3 chains for consolidation

---

## TIER 1 (Primitives) — ✅ NO CHANGES

All Tier 1 tokens are pure scales and seeds. **Keep as-is.**

- Color seeds (`--rux-color-*`)
- Font families, sizes, weights (`--rux-font-*`, `--rux-size-*`, `--rux-weight-*`)
- Spacing, line-height, motion (`--rux-space-*`, `--rux-line-height-*`, `--rux-duration-*`, `--rux-ease-*`)
- Numeric radii (`--rux-radius-0` through `--rux-radius-10`)

---

## TIER 2 (Semantic) — ANALYSIS & RECOMMENDATIONS

### ✅ REUSABLE ACROSS MULTIPLE COMPONENTS (KEEP)

These serve many components; they're genuinely semantic:

**2A. Surfaces**

- `--rux-bg-1` through `--rux-bg-5`, `--rux-bg-overlay` — Used by panels, fields, cards, modals
- ✅ **KEEP**

**2B. Accent & Status**

- `--rux-color-accent`, `--rux-status-*` (red, yellow, green, blue, cyan, purple, pink, auto, etc.)
- Used by trip bars, indicators, alerts across app
- ✅ **KEEP**

**2D. Text Roles**

- `--rux-text-1`, `--rux-text-2`, `--rux-text-3`
- Referenced by form labels, trip bars, day headers, text components
- ✅ **KEEP**

**2E. Border Roles**

- `--rux-border-1`, `--rux-border-2`, `--rux-border-3`
- Used by inputs, cards, modals
- ✅ **KEEP**

---

### 🚨 REDUNDANT (CONSOLIDATE)

**2C. Button Colors** — Only used by Button component

- `--rux-btn-bg-primary` → Move to Tier 2 component scope
- `--rux-btn-bg-secondary`
- `--rux-btn-bg-danger`
- `--rux-btn-text`
- `--rux-btn-hover-lift`
- ❌ **Move to Tier 2, rename `--rux-btn-bg-*` pattern**

**2F. Semantic Radius Aliases** — Only used by ONE Tier 3 token each
| Tier 2 Token | Used By | Referenced | Recommendation |
|---|---|---|---|
| `--rux-radius-button` | `--rux-btn-radius` | Tier 3 Button | Move `--rux-radius-2` directly to Tier 2 `--rux-btn-radius` |
| `--rux-radius-control` | Form fields (implied) | Tier 3 Form | Move to `--rux-fld-radius` (Tier 2) |
| `--rux-radius-section` | Tripbar sections (implied) | Tier 3 components | Move to `--rux-trip-radius` (Tier 2) |
| `--rux-radius-surface` | Panels, cards (implied) | Tier 3 Panel/Cards | Move to `--rux-card-radius`, `--rux-panel-radius` |
| `--rux-radius-overlay` | Modals (implied) | Tier 3 Modal | Move to `--rux-modal-radius` (Tier 2) |
| `--rux-radius-badge` | Badges (implied) | Tier 3 Icons | Move to `--rux-badge-radius` (Tier 2) |

❌ **These are single-use indirection. Eliminate and move directly to component-scoped Tier 2.**

---

## TIER 3 (Component) — ANALYSIS

### Current State: Mixed Conventions & Redundancy

**3A. Text** — Old convention names

- `--text-primary`, `--text-secondary`, `--text-placeholder`, `--text-disabled`
- These should either:
  - Point to Tier 2 (`--rux-text-1`, `--rux-text-2`, etc.)
  - Be renamed to `--rux-text-*` (but redundant with Tier 2)
- ❌ **DELETE or rename to Tier 2 equivalents**

**3B. Form & Fields** — Mixed conventions

- `--rux-form-height` (new convention ✅)
- `--form-row-gap`, `--form-card-gap`, `--field-bg` (old convention ❌)
- `--input-padding-x`, `--input-font-size` (old convention ❌)
- ❌ **Rename ALL to `--rux-fld-*` pattern**

**3C. Button** — Good structure, but contains Tier 2 content

- `--rux-btn-height`, `--rux-btn-radius`, `--rux-btn-padding` ✅ (new convention)
- `--rux-button-icon-*`, `--rux-button-square-icon-*` ✅ (new convention, but naming inconsistent)
- `--btn-shadow-*` (old convention ❌, should be `--rux-btn-shadow-*`)
- ⚠️ **Standardize to `--rux-btn-*` prefix; move shadows to Tier 2**

**3D-3N. Other Components** — Highly variable naming

- `--tripbar-*`, `--bus-*`, `--day-header-*`, `--panel-*`, `--card-*`, `--env-*`
- Mix of old (`--tripbar-*`, `--bus-*`) and new conventions
- ⚠️ **Should be `--rux-trip-*`, `--rux-bus-*`, `--rux-day-*`, etc.**

---

## RECOMMENDED STRUCTURE: 2-TIER SYSTEM

### **NEW TIER 1** (Unchanged)

Primitives: scales, seeds, numeric values

### **NEW TIER 2** (Consolidated)

#### Group A: Reusable Semantics (stay in Tier 2)

- Surfaces: `--rux-bg-1` through `--rux-bg-5`, `--rux-bg-overlay`
- Text roles: `--rux-text-1`, `--rux-text-2`, `--rux-text-3`
- Border roles: `--rux-border-1`, `--rux-border-2`, `--rux-border-3`
- Accent & Status: `--rux-color-accent`, `--rux-status-*`

#### Group B: Component-Scoped (move up from Tier 3)

```
--rux-btn-*           (all button tokens: bg, shadow, height, radius, etc.)
--rux-fld-*           (all field tokens: bg, height, radius, etc.)
--rux-trip-*          (all trip bar tokens)
--rux-bus-*           (all bus column tokens)
--rux-card-*          (all card tokens)
--rux-panel-*         (all panel tokens)
--rux-modal-*         (all modal tokens)
--rux-day-header-*    (day header tokens)
--rux-badge-*         (badge tokens)
etc.
```

#### Group C: Delete

- All `--rux-radius-{semantic}` aliases → replace with direct `--rux-radius-N` references
- All old-convention names → standardize to `--rux-{comp}-{property}`

---

## IMPLEMENTATION ROADMAP

| Phase | Task                                                                                   | Impact                      |
| ----- | -------------------------------------------------------------------------------------- | --------------------------- |
| **1** | Standardize all Tier 2 button, field, component tokens (`--rux-{comp}-{property}`)     | Reduces indirection by ~40% |
| **2** | Delete redundant `--rux-radius-*` semantic aliases; update CSS to use `--rux-radius-N` | Eliminates 6 tokens         |
| **3** | Migrate old-convention Tier 3 names to new convention                                  | Standardizes ~50 tokens     |
| **4** | Delete empty Tier 3 sections; document which Tier 2 section each component uses        | Simplifies structure        |

---

## Summary

**Current:** 3 tiers with ~180+ tokens, many redundant chains (Tier 2 → Tier 3 aliases)

**After Migration:** 2 tiers with ~140 tokens, clear component ownership, no indirection

**Savings:** ~40 token definitions eliminated through consolidation
