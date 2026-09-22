# Release record

## Assisted tracing and measured roof lines — September 22, 2026

| Field | Record |
| --- | --- |
| Scope | Address type-ahead, click-to-add public building footprints, selectable roof lines, typed feet/inches, retained corner dragging |
| Risk class | R3 — geometry changes and external footprint dependency |
| Data model | Project-file version remains 2; outlines and typed dimensions resolve to the existing geographic plane geometry |
| External assumptions | Esri address suggestions and Overpass/OpenStreetMap building footprints are public network dependencies; coverage, accuracy, quotas, and availability vary |
| Measurement rule | Entered roof-line length moves the second endpoint along the existing line direction. The entered value is the pitch-aware surface length for the selected plane. All dependent totals recalculate from the resulting coordinates. |
| Safe fallback | Manual Draw plane remains available when no public footprint exists or the outline service is unavailable |
| Verification | PASS locally: module syntax; deterministic geometry regression including flat and pitch-aware line resizing; Esri type-ahead; selecting a suggestion; click-to-add a real public footprint; clickable dimension labels; line relabel to Ridge; typed 10 ft 6 in measurement; recalculation; no browser warnings/errors. Hosted workflow and deployment are recorded after publishing. Small-screen interaction remains NOT VERIFIED for this release. |
| Open limits | Automatic outline uses mapped building footprints, not aerial-image roof segmentation. It normally supplies an exterior footprint; users still define individual roof planes and label their shared/internal edges. Field verification remains required. |
| Rollback | Baseline tag `baseline-v1.0-2026-09-22`; last deployed GitHub revision before this release |

Decision: use public mapped footprints as an editable starting outline because reliable browser-only roof segmentation is not available from the current free imagery stack. Keep manual tracing authoritative and do not imply that footprint data identifies ridge geometry, overhangs, pitch, or imagery-visible roof edges.
