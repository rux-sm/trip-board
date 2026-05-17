# Trip Bar Geometry Reference

## Where tokens live

All height tokens → `css/trip-bar.css` · **HEIGHT BUDGET** section at the top of `:root`
Schedule row heights → `css/schedule.css` · `:root` (non-compact) and `body.bars-compact`
Compact mode overrides → `css/trip-bar.css` · `body.bars-compact` and `body.bars-compact .schedule-grid__trip-bar.expanded`

---

## Row height formula

Every row's pixel contribution to bar height:

```
row budget = --tripbar-rN-row-height + --tripbar-rN-gap-above
```

`gap-above` is `margin-top` on the row element — it adds vertical space *before* the row.
`row-height` is the CSS grid track size — it sets how tall the row content area is.
`line-height` should fit inside `row-height`; most rows keep it 1px below the track height, while r1 keeps the full 14px line-height and uses its gap only as top breathing room.

---

## Current row budget (all values in px)

| Row | Content | row-height | gap-above | **budget** | line-height |
|-----|---------|------------|-----------|-----------|-------------|
| r1  | Destination title | 14 | 2 | **16** | 14 |
| r2  | Customer          | 11 | 0 | **11** | 11 |
| r3  | Contact / phone   | 11 | 0 | **11** | 11 |
| r4  | Notes + icons     | 14 | 1 | **15** | 13 |
| r5  | Times             | 18 | 1 | **19** | 17 |
| r6  | Drivers           | 16 | 1 | **17** | 15 |
| — | **r1–r6 subtotal** | | | **89** | ← collapsed height |
| r7  | Driver pay        | 15 | 1 | **16** | 14 |
| r8  | Estimate          | 15 | 1 | **16** | 14 |
| r9  | Billing           | 15 | 1 | **16** | 14 |
| r10 | Payment refs      | 15 | 1 | **16** | 14 |
| — | **r1–r10 subtotal** | | | **153** | ← expanded height |
| r11 | Action buttons    | 28 | 4 | **32** | — |
| — | **r1–r11 subtotal** | | | **185** | ← active height |

---

## Bar height tokens

```
--tripbar-height-collapsed:  89px   /* r1–r6  visible */
--tripbar-height-expanded:  153px   /* r1–r10 visible */
--tripbar-height-active:    185px   /* r1–r11 visible (expanded + action bar) */
```

These must equal their row subtotals above. If you change row heights or gaps, update the matching bar height token.

`--tripbar-height` (alias used by JS) resolves to `--tripbar-height-expanded` by default.
In compact mode `body.bars-compact` overrides it to `--tripbar-height-collapsed`.

---

## Schedule row height

The grid row cell is sized to fit exactly one bar plus its insets:

```
--schedule-row-height = bar-height + inset-top + inset-bottom
```

Both modes derive this automatically via `calc()` — changing the bar height or inset tokens updates the row height without touching `schedule.css`.

| Mode | Formula | Current value |
|------|---------|---------------|
| Non-compact | `--tripbar-height-expanded + inset-top + inset-bottom` | `153 + 4 + 6 = 163px` |
| Compact | `--tripbar-height-collapsed + inset-top + inset-bottom` | `89 + 4 + 6 = 99px` |

---

## Outer insets

Space between the bar edge and the row cell edge (not inside the bar):

```
--tripbar-inset-top:    4px   /* also sets bar's CSS top position */
--tripbar-inset-bottom: 6px   /* extra 2px vs top to clear the 8px border-radius visually */
```

The `td` uses `box-sizing: content-box` so `border-bottom: 2px` on the cell is drawn *outside* the row height — no adjustment needed for the border.

---

## Internal bar spacing

```
--tripbar-padding-y: 0px   /* vertical padding inside the bar element */
--tripbar-row-gap:   0px   /* CSS grid row-gap between all tracks */
```

Both are 0px — all vertical rhythm is handled by `row-height` and `gap-above` per row.

The trip-bar grid uses `align-content: start` so row 1 stays pinned to the same top offset in collapsed, expanded, and active states. Centering the grid content will make the destination row drift when the action row appears.

---

## Compact mode row overrides

When `body.bars-compact` is active, rows r7–r10 collapse to 0px and their gaps are zeroed:

```css
body.bars-compact {
  --tripbar-r7-row-height:  0px;
  --tripbar-r8-row-height:  0px;
  --tripbar-r9-row-height:  0px;
  --tripbar-r10-row-height: 0px;
  --tripbar-r7-gap-above:   0px;
  --tripbar-r8-gap-above:   0px;
  --tripbar-r9-gap-above:   0px;
  --tripbar-r10-gap-above:  0px;
}
```

When a compact bar expands (`.expanded`), those rows restore:

```css
body.bars-compact .schedule-grid__trip-bar.expanded {
  --tripbar-r7-row-height:  15px;
  --tripbar-r8-row-height:  15px;
  --tripbar-r9-row-height:  15px;
  --tripbar-r10-row-height: 15px;
  --tripbar-r7-gap-above:    1px;
  --tripbar-r8-gap-above:    1px;
  --tripbar-r9-gap-above:    1px;
  --tripbar-r10-gap-above:   1px;
}
```

---

## JS reads (don't edit these — they follow the tokens)

| What | Where | Reads |
|------|-------|-------|
| Bar height for rendering | `js/schedule.js` · `getBarMetrics()` | `--tripbar-height` from `body` |
| Bar top position | `js/schedule.js` · line ~1587 | `--tripbar-inset-top` from `body` |
| Expand target height | `js/events.js` · line ~359 | `--tripbar-height-active` from bar element |
| Compact hidden row sum | `js/events.js` · lines ~364–373 | r7–r10 `row-height` + `gap-above` from bar element |

---

## Quick adjustment checklist

**Change bar height:** edit `--tripbar-rN-row-height` and/or `--tripbar-rN-gap-above` in the HEIGHT BUDGET section, then update the matching `--tripbar-height-collapsed / expanded / active` to equal the new row subtotal.

**Change spacing between bars:** edit `--tripbar-inset-top` and `--tripbar-inset-bottom`. Keep bottom ≥ top to compensate for the border-radius optical effect.

**Change border-radius:** if `--tripbar-radius` changes significantly, revisit `--tripbar-inset-bottom` — the bottom inset should be large enough to show clear space beyond the curve.
