# nexo School

The revised architecture is approved. Current implementation is limited to an **isolated authentication feasibility spike with synthetic identities**. The broader learning application has not started.

- [Engineering standards — user protocol](docs/engineering/development-protocol.md)
- [Foundation audit and proposed plan](tasks/plan.md)
- [Foundation task checklist](tasks/todo.md)
- [Architecture](docs/architecture/initial-architecture.md)
- [Decision register](docs/architecture/decisions.md)
- [MVP roadmap](docs/product/mvp-scope.md)
- [Authentication spike: run and test](spikes/auth-feasibility/README.md)
- [Findings and remaining device gate](spikes/auth-feasibility/FINDINGS.md)

Trial: https://auth-test.ammarhadid.com. Automated library/HTTPS checks pass. Guided physical testing confirmed the core Tab S9 Ultra/Chrome student flow (including independent PIN-based passkey unlock) and MacBook Chrome guardian approval/revocation/recovery. Safari and remaining physical edge cases are pending; see the dated findings.
