# Taylor Metal Roof Planner — Assisted Tracing Checkpoint 1.1

Checkpoint date: September 22, 2026  
Checkpoint tag: `assisted-tracing-v1.1-2026-09-22`  
Project-file format: version 2

## Identified source

- Live app: https://weserfishley.github.io/taylor-metal-roof-planner/
- GitHub repository: https://github.com/weserfishley/taylor-metal-roof-planner
- Hosted application revision: `3d31b1c`
- Hosted repository revision after verification record: `6a334a6`
- Local checkpoint source before this record: `571c654`
- Governing standard: `ROOF_PLANNER_ENGINEERING_STANDARD.md` version 1.0
- Historical Baseline 1.0 and RPES 1.0 tags remain unchanged.

## Preserved capabilities

This checkpoint includes the original five-step roof workflow, Esri aerial imagery, manual roof-plane tracing, draggable and insertable corners, undo, edge classification, per-plane pitch and direction, pitch-corrected area, panel layout, cut estimates, 3D visualization, project Save/Open, and SVG/CSV exports.

It also includes:

- address type-ahead using Esri suggestions;
- selection of a suggested address and automatic zoom;
- click-to-add public OpenStreetMap building footprints through Overpass;
- automatic fallback guidance when no public footprint is available;
- clickable line-dimension labels;
- ridge, hip, valley, rake, eave, flashing, and unlabeled line types;
- pitch-aware feet-and-inches line resizing;
- retained corner dragging after a typed measurement;
- recalculation of areas, panels, exports, and 3D from the edited geographic geometry.

## Verification recorded at checkpoint

PASS:

- `node --check dist/app.mjs`
- `node --check dist/geometry.mjs`
- `node --check dist/roof3d.mjs`
- `node test-geometry.mjs`
- GitHub Pages deployment workflow run `35796839523`
- hosted Esri address autocomplete and result selection
- hosted click-to-add building footprint using a real public footprint
- hosted clickable dimension labels and Ridge classification
- hosted typed 10 ft 6 in line measurement and recalculation
- hosted browser console check with no warnings or errors during the tested journey

NOT VERIFIED:

- small-screen/touch interaction for the new controls;
- comprehensive accessibility certification;
- complete multi-plane Save → Open browser round trip;
- complete inspection of current SVG and CSV downloads;
- field accuracy against surveyed roofs;
- provider availability, quotas, or commercial terms beyond the tested session.

## Known limits and assumptions

- Auto-outline uses mapped building footprints, not aerial-image segmentation. Coverage and geometry vary by location.
- A footprint is an editable exterior starting point. It does not infer overhangs, ridge geometry, hips, valleys, roof pitch, dormers, or individual roof planes.
- Typed line measurements move the second endpoint along the existing line direction. Users must inspect adjoining geometry and may continue dragging either endpoint.
- Aerial imagery, address search, and footprint lookup require internet access and depend on third-party services.
- Results remain estimates. Field measurements and fabricator review are required before ordering.
- Existing manufacturer-specific, 3D-junction, cloud-storage, and mobile/accessibility limits documented in Baseline 1.0 and RPES remain in force.

## Recovery

Preferred recovery options:

1. Create a separate checkout from tag `assisted-tracing-v1.1-2026-09-22`.
2. Extract `Taylor-Metal-Roof-Planner-Assisted-Tracing-1.1.zip` into a new folder.
3. Run the syntax and geometry checks above before republishing.
4. Deploy the verified `dist/` directory with the existing GitHub Pages workflow.

The archive contains tracked project source, tests, standards, and vendor licenses. It excludes Git metadata, private LFES reference material, customer roof projects, downloaded exports, credentials, and unrelated workspace files.
