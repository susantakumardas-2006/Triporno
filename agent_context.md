# SmartEd agent context

## Naming rules
- Product name: SmartEd
- Roles: Student, Faculty, Institute
- Route prefixes: /app/student/, /app/faculty/, /app/institute/

## Scoring engines
### Mastery engine
- Update from Bayesian Knowledge Tracing with prior 0.3, transition 0.15, slip 0.1, and guess 0.2.
- Every attempt updates the mastery score for each implicated concept.

### Toughness engine
- Institute-authored problems use an Elo-style calibration.
- Seed rating is Easy 1000, Medium 1400, Hard 1800.
- The displayed badge is derived from the live numeric rating and mapped to Easy/Medium/Hard.

## Design system
- Use a black base background and liquid-glass surface styling throughout.
- Keep the monochrome palette with red only for errors and emerald only for the contribution graph.

## Approval model
- Student requests are approved by faculty.
- Faculty requests are approved by institute heads.
- Institute listing is gated by subscription.

## Directory boundaries
- src/: UI, pages, routing, and application shell
- database/: mock data files
- ml-engine/: pure scoring logic
