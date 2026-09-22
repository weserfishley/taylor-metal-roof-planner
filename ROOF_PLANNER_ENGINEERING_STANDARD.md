# Roof Planner Engineering Standard (RPES)

Version: 1.0  
Adopted: September 22, 2026  
Applies to: Taylor Metal Roof Planner

## 1. Purpose and authority

RPES is the internal software-engineering standard for this project. It adapts useful continuity, evidence, and change-control ideas from LFES to the risks of aerial roof measurement and metal-panel estimating.

RPES governs how the application is changed, calculated, tested, documented, and released. `BASELINE.md` records the preserved starting point; this document governs work after that checkpoint. When the two conflict, preserve the Baseline 1.0 behavior unless an approved product change explicitly revises it.

RPES is not a building code, land survey, roofing specification, structural calculation, certification, or professional engineering opinion. It does not establish wind, snow, fire, uplift, drainage, fastening, structural capacity, or code compliance. Manufacturer requirements, field measurements, and qualified professional review remain authoritative for fabrication and installation.

The private LFES source bundle is reference material only. Do not copy or publish that bundle, its identifiers, or MaintainOps-specific operational content with this project.

## 2. Core rules

### RPES-CHG-001 — Preserve working behavior

Make the smallest coherent change that satisfies the request. Preserve unrelated map, tracing, labeling, pitch, measurement, panel, 3D, save/open, and export behavior. Do not replace the working application with a mockup or broad rewrite without explicit approval.

### RPES-CHG-002 — Use recoverable checkpoints

Create a named checkpoint before high-risk changes. A checkpoint must identify the source revision, project-file format, known limits, and recovery method. Historical tags are immutable.

### RPES-CHG-003 — Keep assumptions visible

Record assumptions that affect measurements, ordering, provider availability, file compatibility, or user expectations. Revisit them when a provider, coordinate model, panel profile, calculation, storage model, or deployment target changes.

### RPES-VER-001 — State only what the evidence proves

Use these statuses:

- **PASS** — the stated check ran successfully against the stated build and scope.
- **FAIL** — the check ran and the expected result was not obtained.
- **NOT VERIFIED** — the check did not run, was blocked, or did not cover the claimed boundary.

Static syntax, unit fixtures, local browser checks, hosted browser checks, and field validation are different evidence. One must not be presented as another.

### RPES-OBS-001 — Fail visibly and recoverably

Loading, empty, error, offline, invalid-input, and successful-save states must be understandable. A failed search, imagery load, import, calculation, export, or 3D render must not leave a stuck control or silently discard work.

### RPES-MNT-001 — Keep authority understandable

Separate geometry, panel calculations, rendering, project-file validation, and interface orchestration when doing so reduces real coupling. Do not move code merely to reduce line count. High-risk dependencies must be explicit and testable.

### RPES-SEC-001 — Protect users and project data

Do not ship secrets in browser assets. Validate imported files, escape user-provided text, protect CSV exports from formula execution, constrain resource use, and preserve required map attribution. Customer roof data must not be transmitted or persisted beyond what the interface clearly communicates.

## 3. Risk classes

Classify every planned change by its highest applicable risk.

| Class | Examples | Minimum evidence before release |
| --- | --- | --- |
| R0 — Documentation | Internal wording or records with no runtime effect | Review diff and confirm no public asset changed |
| R1 — Presentation | Color, spacing, nonbehavioral copy, responsive styling | Syntax/resource check plus affected desktop and small-screen view |
| R2 — Interaction | Drawing controls, undo, labeling, forms, map behavior, 3D controls | R1 checks plus targeted browser workflow and one adjacent workflow |
| R3 — Calculation/Data | Projection, areas, pitch, edges, panels, rounding, import/export, project schema | Deterministic fixtures, regression suite, browser workflow, save/open or export checks as applicable |
| R4 — Commercial/Security | Accounts, cloud storage, ordering, payments, backend editor, customer isolation, manufacturer production output | Written boundary plan, threat/risk review, allowed and denied path tests, backup/restore plan, staged rollout, and explicit user approval |

If risk rises during implementation, stop and apply the higher class. Styling that changes visibility, meaning, focus order, hit targets, or conditional display is not R1.

## 4. Measurement model

### RPES-GEO-001 — Geographic source of truth

Store roof vertices as latitude/longitude. Convert them to a documented local metric coordinate system for calculations. Map zoom, screen size, device pixel ratio, and view mode must not change measured results.

### RPES-GEO-002 — Valid geometry

Reject or clearly flag degenerate and self-crossing polygons. Do not silently accept unsupported holes, curved edges, overlapping planes, or ambiguous shared geometry. Exact shared-edge deduplication must be deterministic. Tolerance-based matching requires documented tolerances and regression fixtures.

### RPES-GEO-003 — Explicit units

Keep internal units and display units explicit. Conversion constants must be centralized and tested. Display feet, inches, square feet, degrees, rise-per-12, and roofing squares with their units. One roofing square equals 100 square feet of sloped roof area.

### RPES-GEO-004 — Independent plane pitch

Calculate each plane independently:

`sloped area = plan area × sqrt(1 + (pitch / 12)^2)`

Sum the plane results; do not apply one average pitch to the whole roof. Pitch direction defines downslope orientation. Eave height affects 3D elevation and must not alter plan or sloped area.

### RPES-GEO-005 — Recalculation invariants

Geometry, pitch, direction, and applicable panel settings must update all dependent results from the same current state. A change must not leave stale totals, labels, cut lengths, warnings, exports, or 3D geometry.

### RPES-GEO-006 — Accuracy claims

Do not describe aerial results as surveyed, exact, fabrication-ready, code-compliant, or field-verified. Imagery age, resolution, perspective, roof obstruction, user tracing, and entered pitch create uncertainty. Ordering surfaces must retain a clear field-verification notice.

## 5. Panel-estimating model

### RPES-PNL-001 — Effective coverage

Panel width means installed effective coverage unless the interface explicitly says otherwise. Do not infer physical sheet width, rib geometry, side laps, clips, hems, or manufacturer profile rules from coverage alone.

### RPES-PNL-002 — Length and rounding

Generate each current panel blank from the longest clipped downslope run in its strip. Apply the plane pitch factor, add the entered total end allowance, then round upward to the next whole inch. Do not round down a required cut length.

### RPES-PNL-003 — Overlength handling

Compare calculated lengths with the entered manufacturing limit. Flag overlength panels. Do not silently split them, invent end laps, or claim transportation feasibility.

### RPES-PNL-004 — Waste and order area

Keep net sloped roof area separate from rectangular ordered blank area. Under the present model:

`waste percentage = max(0, (ordered blank area - net sloped area) / ordered blank area × 100)`

Label any future change between waste-as-a-share-of-order and markup-on-net because they are not interchangeable.

### RPES-PNL-005 — Optimization claims

The present layout is a conservative strip estimate. Do not call it nesting, reusable-offcut optimization, engineered lap design, trim takeoff, or fabrication optimization unless those capabilities are deliberately implemented and verified.

### RPES-PNL-006 — Manufacturer profiles

Future manufacturer profiles must version effective coverage, material constraints, maximum/minimum lengths, allowances, fastening assumptions, and applicable trim rules. Profile changes must not silently alter saved projects or prior estimates.

## 6. Project data and compatibility

### RPES-DATA-001 — Explicit schema version

Every saved project must contain a schema version. A format change must retain backward reading for supported versions or provide a tested migration with a clear failure message. Never reinterpret old fields silently.

### RPES-DATA-002 — Round-trip preservation

A Save → Open round trip must preserve geometry, labels, plane names/types, pitch, downslope direction, eave height, panel settings, and other documented editable state. A data-format release cannot pass without a browser round-trip test using a nontrivial multi-plane project.

### RPES-DATA-003 — Import limits

Reject malformed, oversized, nonfinite, out-of-range, or excessively complex input before rendering or calculating it. Validation should identify the problem without exposing sensitive implementation details.

### RPES-DATA-004 — Export truthfulness

SVG, CSV, and future reports must state units, calculation basis, relevant settings, and estimate limitations. Export checks must inspect the downloaded content, not only the button click.

### RPES-DATA-005 — Persistence language

The current Save command downloads a local file. Do not call it cloud saving, autosave, or account persistence. Before cloud persistence is added, define ownership, isolation, deletion, retention, backup, restore, and privacy behavior.

## 7. Interface and accessibility

### RPES-UX-001 — Roof-first workflow

Keep the working roof surface central. Preserve the five-step journey: find and trace, label edges, set pitch, review measurements, then lay out panels and inspect 3D.

### RPES-UX-002 — Visible state

Make the selected plane, active tool, map/plan/3D mode, units, pitch, downslope direction, panel settings, warnings, and save state understandable. Do not rely on color alone for critical meaning.

### RPES-UX-003 — Input and edit safety

Support deliberate completion and cancellation of drawing. Preserve undo for destructive geometry edits. Prevent accidental navigation or mode changes from silently losing an active edit.

### RPES-UX-004 — Keyboard, touch, and responsive use

New controls need meaningful names, visible focus, adequate hit targets, and keyboard operation where applicable. Test changed interactions at desktop and small-screen widths. Touch and mobile claims require touch-oriented verification.

### RPES-UX-005 — Plain-language limitations

Use customer-facing language rather than implementation jargon. Warnings must explain the practical consequence and next action, especially for overlength panels, unavailable imagery, invalid roofs, and unverified measurements.

## 8. External services and dependencies

### RPES-EXT-001 — Imagery and search are dependencies

Keep provider attribution and document the active imagery/search providers. Provider availability, imagery freshness, quotas, accuracy, and license terms are external assumptions. Review commercial suitability before broad customer launch.

### RPES-EXT-002 — Graceful degradation

If address search fails, the user should still be able to navigate the map when imagery is available. If imagery or 3D fails, preserve safe access to any compatible project data and explain available alternatives.

### RPES-EXT-003 — Dependency changes

Changing mapping, geocoding, rendering, hosting, or storage providers is at least R3. Record data-flow, licensing, coordinate, compatibility, privacy, and fallback impacts before release.

## 9. Verification matrix

The following suites are the minimum reusable evidence set.

| Suite | Required proof |
| --- | --- |
| Static | JavaScript module syntax and required resource paths load |
| Geometry | Known dimensions, area, unit conversion, pitch factor, invalid polygon behavior, and shared-edge behavior |
| Panels | All supported widths, custom width limits, direction, allowance, rounding, maximum length, count, order area, and waste definition |
| Editing | Draw, finish, cancel, drag, insert, remove, snap/shared edit, undo, and selection |
| Labels/Pitch | Every edge type, per-plane pitch, downslope direction, eave height, totals, and immediate recalculation |
| Views | Aerial, plan, and 3D show the same current project; changed geometry is not stale |
| Project file | Multi-plane Save → Open round trip, invalid input, version rejection/migration, and size/complexity limits |
| Exports | Download and inspect SVG/CSV names, units, values, escaping, warnings, and formula-injection protection |
| Responsive/access | Desktop and small screen, keyboard focus/order, control names, zoom/text growth, and critical non-color cues |
| Hosted | Intended deployment is actually served; critical path works against hosted external services |

Tests must use deterministic fixtures where possible. For calculation changes, include at least a rectangle, rotated rectangle, irregular convex plane, valid concave plane, mixed-pitch multi-plane roof, exact shared edge, invalid crossed polygon, and overlength-panel case. Tolerances must be explicit.

## 10. Release gates

A release is complete only when:

1. Scope and risk class are recorded.
2. Unrelated behavior is preserved or an intentional change is documented.
3. Required checks for the risk class pass against the release candidate.
4. Results are recorded as PASS, FAIL, or NOT VERIFIED without inflation.
5. Known limits, assumptions, and risks are updated when affected.
6. A rollback source is identifiable for R3/R4 changes.
7. The hosted build is verified when runtime behavior or public assets changed.
8. Customer-facing calculation changes retain field-verification language.

Do not release with a Critical finding. A High finding requires resolution or explicit owner acceptance and a bounded rollout. Medium findings need an owner and planned review. Low findings may be grouped. Informational findings preserve context.

## 11. RPES Gold review

Run a focused RPES Gold review before:

- customer ordering or quoting depends on the output;
- customer accounts or cloud project storage launch;
- the backend panel/profile/color editor launches;
- a mapping, coordinate, or panel-calculation model changes materially;
- payment, sharing, public links, or external integrations launch;
- a major refactor or provider migration;
- claims of production, fabrication, accessibility, mobile, or engineering readiness.

The review evaluates Measurement Correctness, Panel-Estimate Integrity, Reliability, Security/Privacy, Maintainability, Deployment/Recovery, and Usability/Accessibility. It must cite evidence and list unverified boundaries. A score may summarize findings, but it is never certification.

## 12. Required engineering records

Keep these records concise and current:

- `BASELINE.md` — preserved product checkpoint and current known limits.
- `ROOF_PLANNER_ENGINEERING_STANDARD.md` — governing development and release rules.
- Tests — executable calculation and behavior evidence.
- Decision entries — material choices and rejected alternatives.
- Risk entries — unresolved risk, severity, evidence, owner, mitigation, and verification plan.
- Release entries — scope, revision, checks, hosted result, open limitations, and rollback point.

Decision entry template:

| Date | Decision | Reason | Alternatives | Affected rules | Revisit when |
| --- | --- | --- | --- | --- | --- |

Risk entry template:

| ID | Risk | Severity | Evidence | Owner | Mitigation | Verification |
| --- | --- | --- | --- | --- | --- | --- |

Release entry template:

| Version/date | Scope | Risk class | Revision | Verification | Open limits | Rollback |
| --- | --- | --- | --- | --- | --- | --- |

## 13. Initial known risks

| ID | Risk | Severity | Current treatment | Required verification or decision |
| --- | --- | --- | --- | --- |
| RP-R001 | Aerial tracing can differ from field dimensions | High | Estimate warning and field-verification requirement | Compare multiple traced roofs with reliable field measurements before ordering use |
| RP-R002 | Complex overlapping or holed roof geometry is not fully modeled | High | Current supported simple-plane model and validation | Define supported geometry and add fixtures before expanding geometry claims |
| RP-R003 | Current panel model omits manufacturer-specific laps, trims, and fabrication constraints | High | Conservative blank estimate and explicit limitation | Versioned manufacturer profiles plus fabricator-reviewed fixtures |
| RP-R004 | Save/Open and downloaded exports lack a complete browser round-trip certification | Medium | Required by RPES before related release | Execute and record multi-plane round-trip and inspect output files |
| RP-R005 | External imagery/search availability and commercial terms may change | Medium | Attribution and graceful search failure | Provider/license review before commercial launch; document fallback |
| RP-R006 | Independent 3D planes may not form a watertight roof | Medium | 3D is a visualization of entered planes | Add junction solver or retain explicit limitation |
| RP-R007 | Mobile/touch and accessibility coverage is incomplete | Medium | Responsive interface and baseline focus styling | Repeatable small-screen, keyboard, text-zoom, and touch checks |
| RP-R008 | No cloud backup or customer project library exists | Low at current local-file stage | Local downloadable project files | Reclassify as R4 before accounts/cloud storage work |

## 14. Adoption status

RPES 1.0 is adopted as an internal project standard after Baseline 1.0. It changes no runtime behavior and makes no new product-readiness claim. The live application remains at the Baseline 1.0 feature level until a separately requested, implemented, tested, and released change updates it.
