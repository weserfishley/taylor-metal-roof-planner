# Release record

## Eave/rake overhangs and trim parts — October 30, 2026

| Field | Record |
| --- | --- |
| Scope | Selected exterior eave/rake incremental horizontal overhangs; connected collinear rake extension; eave and fascia parts with face heights, color, stock length, linear footage, piece counts and both 3D render paths. |
| Risk class | R3 — roof geometry, elevations, panels, dependent estimates and saved trim settings. |
| Geometry | Offset exterior edge lines and intersect adjacent edge lines; propagate shared endpoint changes, preserve original plane equations by recalculating the low-edge elevation reference, validate polygons and reject newly conflicting seams/corners. Pitches and wall footprints stay fixed. Additions are incremental, not absolute overhang settings. |
| Takeoff | Eave trim uses labeled eaves; fascia uses labeled eaves/rakes. Surface lengths use current pitch-derived heights; geographic duplicate edges counted once. Stock pieces round up per edge with no lap allowance or offcut reuse. |
| Verification | PASS: all existing geometry/data suites plus overhang/trim fixture for 12-inch eave and joined-rake offsets, surface-height preservation, shared ridge, changed area, trim lengths/pieces, input rejection and saved-state round trip. Local browser applied 12-inch eave extension to a 40 × 30 ft house: plan area changed from 1,200 to 1,240 sq ft; enabled trim showed 80 ft eave trim, 149.32 ft fascia and 8 rendered trim faces. Browser file round trip, mobile and WebGL visual checks NOT VERIFIED. |
| Limits | Four-foot maximum per addition, bounded acute corners, no manufacturer profile or fastener modeling. Simple trim faces, no dedicated trim pricing/PDF/CSV integration yet. Local testing build; public site unchanged. |
| Rollback | Commit a711016 / tag click-wall-tools-v2.1-2026-10-30. |

## Click-based wall and opening tools — October 30, 2026

| Field | Record |
| --- | --- |
| Scope | Two-point Plan wall drawing with cursor preview and 14-pixel wall-endpoint snap; clickable wall hit areas in Plan; click wall selection in WebGL and compatibility 3D; compact measured opening dialog; click-to-attach new walls at the nearer endpoint. |
| Risk class | R3 — point placement writes existing wall/opening geometry; schema stays version 6. |
| Interaction | Wall tools enter Locate/trace mode. Label and pitch steps retain roof-edge hit behavior. Escape/Cancel exits wall placement; switching to roof drawing, pan, auto-outline, project open, or typed builder cancels the wall tool. 3D click distinguishes a 6-pixel drag threshold. |
| Verification | PASS locally: syntax and all five geometry/data suites; browser click on compatibility 3D wall placed a visible window; two Plan clicks created a wall with measured length; Plan click on that wall placed a door, visible in 3D. WebGL interaction and mobile/touch NOT VERIFIED. |
| Limits | 3D starts additions from existing wall endpoints; free two-point drawing uses Plan. Opening confirmation remains measured and validated. Existing independent wall/roof constraints and full-height panel blank assumptions still apply. Local testing build; public deployment unchanged. |
| Rollback | Commit ab92e97 / tag walls-openings-v2.0-2026-10-30. |

## Independent walls and measured openings — October 30, 2026

| Field | Record |
| --- | --- |
| Scope | Typed standalone walls; initial attachment to existing structure wall endpoints; measured doors/windows on generated or standalone walls; opening removal, standalone-wall removal and Undo; map wall lines; 3D surface cutouts and frames. |
| Risk class | R3 — geometry, opening deductions, and project schema. |
| Data model | Version 6 stores independent geographic wall endpoints and wallOpenings keyed to stable wall IDs. Versions 2–5 remain readable. Imported malformed, missing-wall, outside-wall and overlapping openings are rejected. |
| Calculation | Net wall surface is decomposed around rectangular openings. Panel layout cells exclude holes; conservative full-height blanks with cutouts remain the ordering basis. Shared interior walls remain included. |
| Verification | PASS: geometry, project, section, wall-panel and new wall/opening fixtures; explicit 20 × 10 ft wall minus 3 × 7 door and 4 × 4 window gives 163 sq ft net area; serialized walls/openings round trip; local browser added a door and window to an existing house wall, attached a standalone return wall, and verified both visible openings after rotating compatibility 3D. Browser file round trip, small-screen interaction and WebGL visual rendering NOT VERIFIED for this local build. |
| Limits | No automatic attachment propagation, extension-roof creation, framing, trim quantities, glass/door objects, door swings, or PDF/CSV wall integration. Existing generated wall dimensions still follow their saved footprint. Local build only. |
| Rollback | Commit 1fbfa12 / tag wall-panels-v1.9-2026-10-30. |

## Vertical wall panel layouts — October 30, 2026

| Field | Record |
| --- | --- |
| Scope | Dedicated wall coverage, length limit, end allowance, color, visibility, gross area, blank area, per-wall quantities and cut list for generated building parts; wall seams in both renderers; optional saved wallPanels settings. |
| Risk class | R3 — new material calculations and optional project data. |
| Calculation | Each rectangular wall independently uses ceiling(width / coverage) panels; cut length is wall height plus allowance rounded upward to the next inch. Final coverage strip is clipped visually while full-width blanks count toward order area. Overlength panels remain flagged. |
| Verification | PASS: existing geometry, project and building-section suites; wall fixture verifies 40 × 30 ft, 10 ft high walls produce 48 panels at 36 inches, 1,400 sq ft gross area, allowances, inch rounding, maximum-length flags, width changes and settings round trip. Local browser confirms 48 wall-panel polylines and visible wall seams in compatibility 3D. WebGL visual test, responsive test, and browser file round trip for the new wall settings NOT VERIFIED. Local test build only. |
| Limits | Vertical rectangular walls only. Gable triangles excluded; windows, doors and shared interior walls not deducted. Wall quantities/prices are not integrated with quote/PDF or roof CSV exports. Wall footprints remain independent of manual roof edits. |
| Rollback | Commit d85b121 / tag building-sections-v1.8-2026-10-30. |

## Multiple named building sections — October 30, 2026

| Field | Record |
| --- | --- |
| Scope | Repeated typed section generation for bedroom, living room, garage, dining room, den, family room, office, and custom additions; independent dimensions, pitch, eave height and X/Y placement; multiple wall footprints in both 3D renderers. |
| Risk class | R3 — generated geometry and project data. |
| Data | Version 5 adds optional building.parts; single-footprint version-5 projects remain readable. Geographic coordinates remain authoritative for roofs. |
| Verification | PASS: syntax, existing geometry and project suites; three-section fixture with placement, heights, aggregate area, and complete part preservation; local browser added bedroom and garage, displayed both in compatibility 3D, downloaded project and reopened it with all four named planes intact. Small-screen interaction and WebGL visual rendering NOT VERIFIED. Public site unchanged. |
| Limits | Independent gable masses do not automatically merge overlapping roofs or remove interior walls. Manual roof edits do not propagate to rectangular wall footprints. This is a local testing build. |
| Rollback | Commit 6e56755 / tag gable-ridge-correction-v1.7.3-2026-10-30. |

## Correct gable ridge orientation — October 30, 2026

| Field | Record |
| --- | --- |
| Scope | Corrected the typed gable-house template's per-plane downslope bearings. Generated planes now rise from both exterior eaves to the common ridge, rather than forming a center valley. |
| Risk class | R3 — generated pitch direction, roof elevation, panel runs, and 3D geometry. |
| Verification | PASS locally: deterministic fixture asserts 10 ft eaves and a 17 ft 6 in shared ridge for a 40 × 30 ft, 6/12 gable; geometry and project suites pass; compatibility renderer visually inspected at two rotations with panel layout enabled. Existing already-generated local geometry must be regenerated to use the corrected bearings. |
| Rollback | Tag `interactive-compatibility-3d-v1.7.2-2026-10-30` |

## WebGL-free 3D compatibility preview — October 30, 2026

| Field | Record |
| --- | --- |
| Scope | SVG isometric 3D fallback when the primary WebGL viewer cannot initialize. It renders the same plane surfaces, pitch-derived heights, generated walls, and optional panel outlines used by the current project state, with drag rotation and scroll/pinch zoom. |
| Risk class | R2 — rendering fallback only; it does not write geometry or alter estimation inputs. |
| Behavior | The primary WebGL viewer remains preferred. On initialization failure, the application shows an explicit compatibility-preview notice instead of a blank/unavailable 3D area. 3D report image capture remains a WebGL-only capability. |
| Verification | PASS locally: JavaScript syntax and geometry/project suites; a generated 40 × 30 ft, 6/12 gable house switched from a failed WebGL renderer to the visible compatibility 3D preview in the in-app browser. Hosted GitHub Pages is unchanged. |
| Rollback | Tag `typed-house-builder-v1.7-2026-10-30` |

## Typed gable-house builder — October 30, 2026

| Field | Record |
| --- | --- |
| Scope | A **Build by dimensions** workflow for a width, depth, wall/eave height, and pitch input; two connected editable gable roof planes; immediate ridge/eave/rake labeling; saved building footprint/wall-height state; and simple 3D exterior walls beneath the generated roof. |
| Risk class | R3 — generated topology, project schema, 3D presentation, and dependent estimates. |
| Geometry rule | Inputs create a north/south gable template centered on the current map view. The shared ridge is represented by common geographic vertices and is accepted only when the two entered pitched surfaces align. Every generated point, edge, and plane remains editable through the established drawing tools. |
| Data model | Project-file version 5 adds an optional `building` footprint and wall/eave-height record. Versions 2–4 load with no generated-building record and retain their existing geometry. |
| Safety rule | The builder is a geometric starter, not a framing, structural, survey, code, fabrication, or field-verification tool. It does not alter an entered pitch or size to force a junction. |
| Verification | PASS locally: JavaScript syntax; deterministic 40 × 30 ft template fixture with correct 1,200 sq ft footprint, sloped surface, edge labels, and aligned shared ridge; version-5 save/load fixture; browser generation from typed 48 × 32 ft, 11 ft wall, 7/12 pitch inputs produced two editable 889 sq ft planes, 1,536 sq ft plan area, one aligned 3D junction, 48 ft ridge, 96 ft eaves, and 72 calculated panels. The headless test browser cannot render WebGL, so generated 3D walls are NOT VERIFIED visually. Hosted GitHub Pages is unchanged and NOT VERIFIED for this local change. |
| Rollback | Published commit `f68b69d` / tag `predictive-snapping-v1.6-2026-09-28` |

## Predictive roof snapping and immediate edge editing — September 28, 2026

| Field | Record |
| --- | --- |
| Scope | Immediate roof-edge selection and labeling; live edge-total refresh; ranked snapping to shared roof points, roof edges/intersections, outline geometry, and optional 1-foot recommended grid points; visible snap destination; larger transparent touch hit areas; two-plane shared-corner junction reconciliation. |
| Risk class | R3 — topology mutation, pitched geometry, 3D output, and dependent estimates. |
| Interaction rule | A selected edge remains selected while its label is written on `input` and `change`; the map, tooltip, and combined edge totals refresh in the same render cycle. Auto Snap may be disabled or bypassed with Alt for intentional free placement. |
| Geometry rule | Shared geometry wins over visual-grid suggestions. The solver projects a valid two-plane shared corner onto the exact intersection line, while retaining pitch and eave elevation. Invalid or over-bounded constraints stay visibly unresolved. |
| Mobile rule | Visible handles remain compact while their transparent interactive areas are 44 × 44 pixels. Nearby targets use a larger coarse-pointer search radius and show the intended landing point while drawing or dragging. |
| Verification | PASS locally: JavaScript syntax; full geometry regression including two- and three-plane solving, pitch/eave preservation, conflict retention, and cross-polygon rejection; version-4 project round trip including `gridSnap`; immediate first-selection edge relabel plus live Ridge total in browser; 390 × 844 responsive control inspection; no browser console warnings/errors. Hosted GitHub Pages verification is pending deployment. |
| Open limits | This remains a local, bounded constraint solver rather than a global roof-network optimizer. A grid point is a recommendation, not a measurement source; field verification is still required. |
| Rollback | Tag `junction-solver-v1.5-2026-09-23` |

## Tolerance-bounded topology and multi-plane junction solver — September 23, 2026

| Field | Record |
| --- | --- |
| Scope | Configurable 0.5–24 inch junction-snap tolerance; nearby cross-plane vertex clustering; insertion of a shared vertex where a plane corner terminates near another plane edge; pitch-equation reconciliation of shared edges; least-squares XYZ solution for corners shared by three or more planes; named conflict diagnostics; 3D conflict markers |
| Risk class | R3 — topology mutation, pitched geometry, 3D output, and every dependent measurement/takeoff calculation |
| Topology rule | Only vertices on different planes participate. Nearby vertices share one geographic coordinate. A vertex near the interior of another plane edge is inserted into that edge so the connection is topological rather than merely visual. Ambiguous clusters containing multiple corners from the same face are not auto-collapsed. |
| Geometry rule | Nonparallel two-plane edges use the exact intersection of their entered plane equations. Parallel planes with inconsistent entered elevations remain unresolved. Three-or-more-plane corners use a full-rank least-squares XY solution and are accepted only when all resulting heights agree within 1 inch. Pitch and eave elevation are never changed. |
| Safety rule | Proximity repair is limited by the user-selected tolerance. Plane-intersection movement remains capped at 6 feet per pass. Rank-deficient, residual-conflicting, oversized, or polygon-invalid solutions remain unresolved; invalid polygon changes restore the pre-solve geometry. |
| Recalculation rule | Manual corner, edge, and plane drags invoke the same solver, then rebuild the summary, panels, measurements, edge totals, and 3D model through the existing render path. |
| Verification | PASS locally: module syntax; prior geometry and project suites; near-edge gap closure; vertex-on-edge insertion; exact shared-key creation; pitch preservation; solvable three-plane junction; unsolvable parallel three-plane conflict retention; project save/open preservation of snap tolerance. Browser: two adjoining planes reported one aligned junction and rendered one continuous 3D seam; no console warnings/errors. Small-screen interaction and hosted GitHub Pages are NOT VERIFIED for this local change. |
| Open limits | This is a bounded local constraint solver, not a global nonlinear roof-network optimizer. Collinear/rank-deficient three-plane systems and mutually inconsistent entered constraints remain warnings. Automatic topology repair does not infer which separated edges were intended to meet beyond the configured proximity tolerance. |
| Rollback | Tag `estimating-reports-v1.4-2026-09-23` |

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
