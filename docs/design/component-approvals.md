# Shared UI approval register

The user approves a specific component revision and contract. Storybook must render the same implementation/styles as the application. No product brand or component is approved yet.

| Component | Revision | Stories / contract | Status | Verification evidence | User approval / date | Supersedes |
|---|---|---|---|---|---|---|

For each review, record a Git commit and component path (or immutable content hash before commit), story IDs, public props and meaningful states, tests/manual findings, and the explicit user approval reference/date. Draft can change; In Review means documented behavior and required checks are ready; Approved requires the user's explicit response. Retain prior revision evidence when a new review is needed. Batch related variants.

Example procedure (not a fictional approval): create a Draft record, attach stories/test evidence to a fixed revision and move it to In Review, then enter the actual user response only if approval is received. Changing the reviewed revision invalidates that review reference until reconciled. Do not erase previously approved behavior or silently accept new visual baselines.

The foundation notice is a development fixture, not a proposed product component or approved visual identity. Its wiring story does not authorize a button/form catalogue. Brand options and representative student/guardian compositions are the next design milestone.
