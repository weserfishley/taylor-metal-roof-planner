# Taylor Metal Roof Planner

An interactive web application for tracing roof planes over aerial imagery, labeling roof edges, applying per-plane pitch, reviewing estimated roof area, laying out metal panels, and inspecting a 3D visualization.

## Use the app

Live app: https://weserfishley.github.io/taylor-metal-roof-planner/

1. Start typing an address, choose an autocomplete result, and confirm the building on the aerial map.
2. Use Auto-outline and click a building to create an editable overall-boundary snap guide, or proceed without one.
3. Draw each roof plane manually inside the outline. New corners snap to nearby outline segments, outline corners, and existing plane geometry.
4. Click a roof line to highlight it immediately, then label it ridge, hip, valley, rake, eave, or flashing. Enter field-measured feet and inches when available.
5. Set the pitch and downslope direction for every plane. Shared edges are checked against both pitched plane equations before the 3D model is trusted.
6. Choose effective panel coverage and review estimated lengths and quantities.

Connected roof planes share their snapped vertices. Drag a corner, the diamond edge handle, or the center move handle to refine the roof while keeping adjoining geometry connected. With **Keep connected planes snapped** enabled, nearby vertices and vertices close to an adjoining edge become shared topology within the configurable 0.5–24 inch tolerance. Geometry edits then reconcile safe nonparallel shared-edge intersections, and corners shared by three or more planes are solved as one XYZ junction. The solver preserves entered pitch and eave elevation, limits automatic horizontal movement to six feet per pass, and leaves offset, oversized, rank-deficient, or invalid constraints highlighted by plane and edge name for manual review.

Project-file version 4 restores the complete editable session: outlines, planes, stable object IDs, roof-line labels, pitch, panel/material settings, customer and quote information, map position, workflow step, selected geometry, panel visibility, and 3D camera. Version 2 and version 3 files remain readable and are upgraded when saved again.

The live takeoff displays combined ridge, hip, valley, rake, and eave lengths. The customer-report workflow uses those same live calculations for pricing and produces print-ready quote, material, panel-layout, and full-project report options. Reports may include five 3D perspectives with the calculated panel layout; use the browser print window to save the result as PDF.

The application uses Esri aerial imagery and address autocomplete plus OpenStreetMap building footprints through the public Overpass API. It does not require a Google Maps API key. Footprint coverage and geometry vary. Automatic outlines are editable snap guides only: they are excluded from roof area, panels, cut lists, exports, and 3D calculations.

## Important limitation

This application produces aerial estimates, not surveys, structural calculations, code determinations, or fabrication approval. Automatic reconciliation first repairs only small, tolerance-bounded 2D gaps, then evaluates the mathematical pitched-plane intersections while preserving each plane’s entered pitch. It does not globally optimize arbitrary overlapping surfaces or silently alter protected measurements. Over-constrained, rank-deficient, oversized, or invalid junctions remain visibly flagged. Verify pitch and critical dimensions in the field and have the selected manufacturer or fabricator review the order before purchasing material.

## Project structure

- `dist/` — deployable static web application
- `test-geometry.mjs` — deterministic geometry and panel fixtures
- `BASELINE.md` — preserved Baseline 1.0 behavior and known limits
- `ROOF_PLANNER_ENGINEERING_STANDARD.md` — project engineering and release standard

## Local checks

```text
node --check dist/app.mjs
node --check dist/roof3d.mjs
node test-geometry.mjs
```

Serve `dist/` from an HTTP server for local browser testing. Direct `file:` loading is not supported because the application uses JavaScript modules.

## GitHub Pages

Pushes to `main` run `.github/workflows/pages.yml`. The workflow verifies the JavaScript and geometry fixtures, then publishes only `dist/` to GitHub Pages.

## License

No open-source license has been granted. All rights are reserved unless the repository owner adds a license later.
