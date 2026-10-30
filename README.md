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

For a typed starting point, choose **Build by dimensions** and enter the house width, depth, wall/eave height, and pitch. It creates a centered, editable gable-house template with two connected roof planes and labeled ridge, eaves, and rakes. You can then drag the points, type individual line measurements, relabel edges, and adjust each plane just like a traced roof.

Connected roof planes share their snapped vertices. Drag a corner, the diamond edge handle, or the center move handle to refine the roof while keeping adjoining geometry connected. With **Keep connected planes snapped** enabled, nearby vertices and vertices close to an adjoining edge become shared topology within the configurable 0.5–24 inch tolerance. Geometry edits then reconcile safe nonparallel shared-edge intersections, and corners shared by three or more planes are solved as one XYZ junction. The solver preserves entered pitch and eave elevation, limits automatic horizontal movement to six feet per pass, and leaves offset, oversized, rank-deficient, or invalid constraints highlighted by plane and edge name for manual review. Predictive snapping prioritizes shared roof points, roof edges/intersections, the outline, then optional 1-foot grid recommendations; the preview shows the landing point and Auto Snap can be temporarily bypassed with Alt.

Project-file version 5 restores the complete editable session: outlines, planes, generated-building footprint and wall height, stable object IDs, roof-line labels, pitch, panel/material settings, customer and quote information, map position, workflow step, selected geometry, panel visibility, and 3D camera. Version 2 through version 4 files remain readable and are upgraded when saved again.

The live takeoff displays combined ridge, hip, valley, rake, and eave lengths. The customer-report workflow uses those same live calculations for pricing and produces print-ready quote, material, panel-layout, and full-project report options. Reports may include five 3D perspectives with the calculated panel layout; use the browser print window to save the result as PDF.

The primary 3D viewer uses WebGL. If a browser blocks WebGL, the planner automatically switches to an SVG compatibility 3D preview so the roof surfaces, walls, pitch-derived heights, and optional panel layout remain reviewable. Drag horizontally to rotate the compatibility view and scroll or pinch to zoom. It is a simplified inspection renderer and does not provide photorealistic shading or captured 3D report perspectives.

The application uses Esri aerial imagery and address autocomplete plus OpenStreetMap building footprints through the public Overpass API. It does not require a Google Maps API key. Footprint coverage and geometry vary. Automatic outlines are editable snap guides only: they are excluded from roof area, panels, cut lists, exports, and 3D calculations.

## Important limitation

**Wall panels:** Open **Wall layout & cut list** in the right sidebar. Set vertical-panel effective coverage in inches, maximum length in feet, end allowance in inches, color, and Show wall panels in 3D, then Apply. Counts and cut lengths are separate from roof panels and saved with the project. This first version covers gross rectangular section walls below eave height: it includes each section perimeter without shared-wall or door/window deductions and excludes gable triangles. Wall takeoffs are shown in their own dialog; existing quote/PDF and roof CSV exports do not include wall materials or pricing.

Use **Add building section** repeatedly to create Bedroom, Living room, Garage, Dining room, Den, Family room, Office, or Custom addition sections. Each has width, depth, wall/eave height, pitch, and X/Y placement measured in feet from the project origin. Each generates two editable gable roof planes and a saved rectangular wall footprint. Sections are building masses, not interior room partitions. Overlapping roof planes are not automatically trimmed into a combined roof; edit intersections before using a takeoff. Roof-point edits do not automatically reshape the stored wall footprint.

This application produces aerial estimates and editable templates, not surveys, structural calculations, code determinations, or fabrication approval. The typed house builder is a gable starter only; it does not design framing or certify wall, roof, or intersection dimensions. Automatic reconciliation first repairs only small, tolerance-bounded 2D gaps, then evaluates the mathematical pitched-plane intersections while preserving each plane’s entered pitch. It does not globally optimize arbitrary overlapping surfaces or silently alter protected measurements. Over-constrained, rank-deficient, oversized, or invalid junctions remain visibly flagged. Verify pitch and critical dimensions in the field and have the selected manufacturer or fabricator review the order before purchasing material.

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
