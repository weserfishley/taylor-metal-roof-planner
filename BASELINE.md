# Taylor Metal Roof Planner — Baseline 1.0

Checkpoint date: September 22, 2026

This is the agreed starting point for future development, not a claim of production certification. The user requested a saving point and baseline standards. No app behavior or live deployment is changed by this checkpoint.

- Live app: https://taylor-metal-roof-planner.taylor-metal-1153.chatgpt.site/
- Preserved application source: `62a9a3b6412c18aa73e6f97fc2129e7995288ee4`
- Local checkpoint tag: `baseline-v1.0-2026-09-22`
- Project-file format: version 2. This is separate from the Baseline 1.0 milestone name.

## 1. Product and workflow standards

Keep this an interactive web application, with the existing Taylor Metal navy/cyan visual direction and a roof-centered workspace. Preserve the five-step journey: find and trace; label edges; set pitch; review measurements; lay out panels and review 3D.

Preserve existing capabilities unless the user requests a change. New work should extend this checkpoint, not replace it with a nonfunctional mockup. Do not add paid services, change site access, or replace the interface direction without the user's approval.

## 2. Baseline capabilities to preserve

| Area | Current baseline |
| --- | --- |
| Map | Interactive Esri aerial imagery with attribution, pan, zoom, map lock, and fit-roof controls; no Google API key configured. |
| Address search | Submit an address and select a matching result. This is not type-ahead autocomplete. |
| Roof tracing | Separate roof-plane polygons stored as latitude/longitude; draggable corners, corner insertion/removal, nearby-corner snapping, shared-corner editing, and undo. |
| Classification | Main roof, dormer, porch, and garage plane types; ridge, hip, valley, rake, eave, flashing, and unlabeled edges. |
| Pitch | Per-plane rise per 12 inches, downslope direction, and low-eave height. |
| Measurements | Plan area, pitch-corrected area, roofing squares, dimensions, and labeled-edge totals. Exact matching shared edges are counted once. |
| Panels | Effective coverage widths of 12, 16, 18, 20, 32, 34, and 36 inches, plus custom width; maximum cut length, total end allowance, and color controls. |
| Visualization | Aerial, plan, and interactive 3D views derived from the same roof geometry and pitch settings. |
| Outputs | Editable project JSON, dimensioned SVG roof plan, and CSV panel cut list. |

## 3. Measurement and panel standards

- Geometry is geographic, not screen-pixel based. Zooming or resizing the browser must not change measurements. Local calculations use meters internally; display feet, inches, square feet, and roofing squares with explicit units.
- Calculate each plane independently: `sloped area = plan area × sqrt(1 + (pitch / 12)^2)`. One roofing square is 100 square feet of sloped area. Sum individual plane results; do not apply one average pitch to the entire roof.
- Pitch direction controls slope and panel orientation. Eave height controls elevation, not roof area. Recalculate affected results after geometry, pitch, direction, or panel-setting changes.
- Width means effective installed coverage, not an assumed physical sheet width. Manufacturer profile dimensions and side-lap rules are not yet modeled.
- Current panel quantities come from strips clipped to each plane. Cut lengths use the longest run within each strip, corrected for pitch, plus the entered total end allowance, rounded UP to a whole inch.
- Treat cuts as conservative rectangular blanks. Do not describe the result as optimized nesting, reusable offcut allocation, or engineered end laps. Flag overlength panels; do not silently split them or invent lap dimensions.
- Distinguish net roof area from ordered blank area. The current waste percentage is `(ordered area - net sloped area) / ordered area × 100`, floored at zero; it is not a markup percentage on net area.
- Never imply survey accuracy. Aerial imagery age, resolution, tree cover, tracing, and entered pitch affect estimates. Field verification and fabricator review are required before ordering.

## 4. Interface and data standards

- Keep the roof visible while editing and keep selected-plane settings clear. Controls need meaningful labels, visible focus states, readable units, and useful loading, empty, error, and success feedback.
- Retain desktop and small-screen layouts. Check keyboard access and touch usability for changed interactions; do not claim full accessibility or mobile certification without testing.
- Preserve undo for destructive geometry edits. Do not discard work silently when changing modes.
- Project files must retain geometry, labels, names/types, pitches, directions, heights, and panel settings. Future format changes must either read version-2 files or provide an explicit migration path.
- Save is a local download, not cloud saving or autosave. Do not imply browser work survives a refresh without a saved project file.
- Keep imported text escaped and spreadsheet exports protected against formula injection. Reject invalid project input with useful feedback. No secrets or private credentials in browser assets or downloadable backups.
- Preserve imagery attribution. The current public-provider connection needs no user-supplied key, but availability, commercial suitability, quotas, and long-term cost are not guaranteed. Review provider terms before a broader commercial launch.

## 5. Regression checks and evidence

Automated check: run `node test-geometry.mjs`. Syntax checks: `node --check dist/app.mjs` and `node --check dist/roof3d.mjs`.

The numerical fixture is a 40 × 20 ft rectangle at 6/12 pitch with zero end allowance:

| Check | Expected result |
| --- | --- |
| Plan area | 800 ft² |
| Sloped area | Approximately 894.427191 ft² |
| 16-inch coverage | 30 panels, each rounded to 22 ft 5 in |
| 12-inch coverage | 40 panels |
| 36-inch coverage | 14 panels; all exceed a 20 ft limit |
| Resize rectangle to 50 × 20 ft | 1,000 ft² plan area |
| Rotate panel direction by 90° at 16 inches | 15 panels |

The suite also checks mixed-plane pitch totals, height calculations, reversed direction, and rejection of a crossed-polygon example. These tests cover specified fixtures, not every geometry edge case.

Previous implementation-session browser checks passed: real imagery; submitted address search; four-corner drawing; corner dragging and undo; edge labeling; 3D rendering; pitch changes; and panel-width changes. These are recorded historical checks, not a fresh browser certification at this checkpoint.

Before a future release, test the changed journey and its affected calculations. For a release affecting project data or exports, complete a browser Save → Open round trip and inspect exported SVG/CSV contents. Save/Open round-trip and export-file correctness have not yet been fully browser-verified at this baseline. For UI changes, test a small-screen viewport and keyboard navigation. Record results and unresolved issues rather than claiming untested behavior passes.

## 6. Known limits and future work

- No automatic roof detection, address autocomplete, reliable roof pitch extraction, or saved aerial-image snapshot.
- The SVG export is a dimensioned plan, not a cached satellite image. An internet connection is needed for aerial tiles and address search.
- 3D planes use independent pitch, direction, and eave-height values; adjoining planes are not automatically solved into a watertight building.
- Opening a project fits the saved roof; exact saved viewport restoration is not implemented, although view metadata is written on save.
- No cloud project library, account workflow, or backend panel/profile/color sandbox. Those remain later development phases.
- No automatic treatment of overlapping roof planes, complete validation of all complex polygons, manufacturer-specific trim orders, structural engineering, or fabrication-ready optimization.
- Per-panel arbitrary manual cut editing is not implemented. Current controls generate lengths from the geometry and allowance, with a maximum-length warning.

## 7. Checkpoint and change procedure

The local tag identifies the source plus these standards. The downloadable ZIP contains the tracked source, libraries/licenses, tests, and standards; it does not contain private credentials, Git metadata, or a customer's unsaved browser roof project. Use the app's Save project button separately to preserve a roof you have drawn.

For future work: state the requested change, preserve unrelated behavior, make the smallest coherent implementation, run the relevant checks, and record any deliberate change to these standards. Do not move or overwrite this tag; create a new named checkpoint for a later milestone.

To recover, extract the ZIP into a new folder or create a separate checkout from the checkpoint tag. Verify it before publishing through the existing Sites project. Restoring local files alone does not roll back the live app, and external imagery/search services are not frozen by this backup.
