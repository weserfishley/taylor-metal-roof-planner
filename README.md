# Taylor Metal Roof Planner

An interactive web application for tracing roof planes over aerial imagery, labeling roof edges, applying per-plane pitch, reviewing estimated roof area, laying out metal panels, and inspecting a 3D visualization.

## Use the app

The GitHub Pages address will be added after the first deployment.

1. Find an address and confirm the building on the aerial map.
2. Draw one roof plane at a time and refine its corners.
3. Label ridge, hip, valley, rake, eave, and flashing edges.
4. Set the pitch and downslope direction for each plane.
5. Choose effective panel coverage and review estimated lengths and quantities.

The application uses Esri aerial imagery and a public address-search service. It does not require a Google Maps API key.

## Important limitation

This application produces aerial estimates, not surveys, structural calculations, code determinations, or fabrication approval. Verify pitch and critical dimensions in the field and have the selected manufacturer or fabricator review the order before purchasing material.

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
