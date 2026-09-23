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

The application uses Esri aerial imagery and address autocomplete plus OpenStreetMap building footprints through the public Overpass API. It does not require a Google Maps API key. Footprint coverage and geometry vary. Automatic outlines are editable snap guides only: they are excluded from roof area, panels, cut lists, exports, and 3D calculations.

## Important limitation

This application produces aerial estimates, not surveys, structural calculations, code determinations, or fabrication approval. Only exact shared 2D edges are currently checked for pitched-plane agreement. Unresolved junctions are reported and displayed as gaps; the application does not silently move geometry to hide them. Automatic intersection solving for arbitrary planes remains a future geometry-engine phase. Verify pitch and critical dimensions in the field and have the selected manufacturer or fabricator review the order before purchasing material.

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
