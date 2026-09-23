# Release record

## Complete project files and estimating reports — September 23, 2026

| Field | Record |
| --- | --- |
| Scope | Complete Save/Open restoration; stable geometry IDs; customer, quote, material, and pricing state; always-visible ridge/hip/valley/rake/eave totals; configurable print/PDF reports; five 3D report views with optional calculated panel layout |
| Risk class | R3 — project schema, calculation reporting, imports/exports, and 3D capture. Pricing is an estimator input, not an ordering or payment system. |
| Data model | Project-file version 4. Versions 2 and 3 migrate with safe defaults. Derived areas, edge totals, panels, cuts, pricing, and report content are recalculated from the restored geometry and current settings rather than trusted as stale saved totals. |
| Pricing rule | Panel material uses ordered blank area × entered price per square foot. Each trim category uses its live deduplicated linear footage × its entered rate. Accessories use entered quantity × unit price. Tax applies to the calculated subtotal. |
| Verification | PASS locally: module syntax; existing geometry suite; version-4 nontrivial multi-plane JSON round trip; stable IDs, selections, map/3D state, labels, pitches, materials and quote data; legacy migration and invalid-input rejection; report/pricing fixtures; browser project open; restored workflow step, panel visibility, totals, selected plane and 3D view; five-view report capture without console warnings/errors; 600 × 900 responsive control check. Browser download initiation passed. Hosted deployment is NOT VERIFIED and is not part of this local change yet. |
| Open limits | Reports use the browser print dialog for Save as PDF. Pricing is user-entered and has no catalog, inventory, payment, tax-jurisdiction, or manufacturer-rule integration. Panel overrides are reserved in the schema but arbitrary per-panel editing is not implemented. Browser-generated PDFs can vary slightly by print engine. |
| Rollback | Tag `connected-geometry-v1.3-2026-09-23` |

## Connected plane editing and safe junction solver — September 23, 2026

| Field | Record |
| --- | --- |
| Scope | Connected corner propagation; draggable edges and whole planes; optional automatic pitched-junction reconciliation; refined 3D materials, fascia depth, lighting, and shadows |
| Risk class | R3 — geometry mutation, 3D output, and takeoff recalculation |
| Constraint rule | Exact shared geographic endpoints define a connection. Manual corner, edge, and plane moves propagate to every face using those endpoints. |
| Solver rule | Parallel surface offsets reconcile by changing the non-selected plane’s vertical reference. Nonparallel surfaces project the shared endpoints onto the mathematical surface-intersection line. Entered pitch is never changed. |
| Safety rule | Automatic horizontal movement is capped at 6 feet per solver pass. Invalid polygons are restored. Oversized, ambiguous, or unresolved constraints remain highlighted for manual adjustment. |
| Verification | PASS locally: syntax, deterministic geometry including anchored height and pitched-intersection solutions, edge dragging, whole-plane dragging with connected-neighbor propagation, aligned junction retention, 3D rendering, and no browser console warnings/errors. Save/open round trip, small-screen interaction, and deployed GitHub Pages are NOT VERIFIED for this release. |
| Open limits | Constraint ordering is deterministic but not a global least-squares solve. Networks with competing three-or-more-plane constraints may require manual adjustment. Only exact shared edges participate. |
| Rollback | Tag `geometry-foundation-v1.2-2026-09-23` |

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
