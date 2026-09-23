# Release record

## Outline/plane separation and pitched-junction validation — September 23, 2026

| Field | Record |
| --- | --- |
| Scope | Separate overall roof boundary from individual roof planes; segment and vertex snapping; first-click roof-line selection; pitch-aware shared-edge validation; 3D conflict display |
| Risk class | R3 — geometry, project schema, and 3D behavior |
| Data model | Project-file version 3 adds `outlines`; version 2 files migrate with an empty outline collection |
| Geometry rule | Overall outlines are snap guides only and never contribute area, panels, cut lists, exports, or 3D meshes. Each authored roof plane remains independently authoritative. |
| Junction rule | Planes are adjoining only when they share the same two geographic edge endpoints. Both plane equations are evaluated at both endpoints. Agreement within 1 inch is aligned; a constant mismatch is an offset; varying mismatch is a pitch/direction conflict. |
| Safety behavior | The system reports and visualizes unresolved junctions instead of moving vertices, changing pitch, or manufacturing a watertight model that does not match user input. |
| Verification | PASS locally: module syntax, deterministic geometry regression, manual plane drawing, vertex snapping across adjoining planes, aligned-junction detection, pitch-conflict detection, first-click line highlight, line relabeling, live address suggestions, 3D rendering with a visible unresolved gap, and project-save initiation. Public auto-outline returned its documented manual fallback during this run. Project-open round trip, small-screen interaction, and deployed GitHub Pages remain NOT VERIFIED. |
| Open limits | Arbitrary pitched-surface intersection solving, topology repair, overlap detection, and constraint propagation are not implemented. Snapping is proximity-based assistance and does not certify measurements. |
| Rollback | Tag `assisted-tracing-v1.1-2026-09-22` |

## Assisted tracing and measured roof lines — September 22, 2026

| Field | Record |
| --- | --- |
| Scope | Address type-ahead, click-to-add public building footprints, selectable roof lines, typed feet/inches, retained corner dragging |
| Risk class | R3 — geometry changes and external footprint dependency |
| Data model | Project-file version remains 2; outlines and typed dimensions resolve to the existing geographic plane geometry |
| External assumptions | Esri address suggestions and Overpass/OpenStreetMap building footprints are public network dependencies; coverage, accuracy, quotas, and availability vary |
| Measurement rule | Entered roof-line length moves the second endpoint along the existing line direction. The entered value is the pitch-aware surface length for the selected plane. All dependent totals recalculate from the resulting coordinates. |
| Safe fallback | Manual Draw plane remains available when no public footprint exists or the outline service is unavailable |
| Verification | PASS locally and on GitHub Pages: module syntax; deterministic geometry regression including flat and pitch-aware line resizing; Esri type-ahead; selecting a suggestion; click-to-add a real public footprint; clickable dimension labels; line relabel to Ridge; typed 10 ft 6 in measurement; recalculation; no browser warnings/errors. GitHub Actions run 35796839523 passed and deployed commit `3d31b1c`. Small-screen interaction remains NOT VERIFIED for this release. |
| Open limits | Automatic outline uses mapped building footprints, not aerial-image roof segmentation. It normally supplies an exterior footprint; users still define individual roof planes and label their shared/internal edges. Field verification remains required. |
| Rollback | Baseline tag `baseline-v1.0-2026-09-22`; last deployed GitHub revision before this release |

Decision: use public mapped footprints as an editable starting outline because reliable browser-only roof segmentation is not available from the current free imagery stack. Keep manual tracing authoritative and do not imply that footprint data identifies ridge geometry, overhangs, pitch, or imagery-visible roof edges.
