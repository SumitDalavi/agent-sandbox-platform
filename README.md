# agent-sandbox-platform

> Can an AI agent fix a service while the platform prevents it from exceeding its authority?

An isolated execution platform for AI agents. An agent is given a broken service and a bounded toolset inside a disposable sandbox. Every command passes through policy, risky actions need human approval, results are verified by independent tests, and the whole run leaves a sanitized evidence bundle.

**Status: personal portfolio project. Not production-deployed. Not security-audited.**

## Capability status (keep honest)

| Capability | Status |
|---|---|
| Sandbox lifecycle API (create/exec/snapshot/destroy) | Planned |
| Container backend (hardened) | Planned |
| MicroVM backend (Firecracker) | Planned (stretch; requires KVM host) |
| Policy engine (allowlists, limits) | Planned |
| Agent loop with real model calls | Planned |
| Human approval gate | Planned |
| Independent verification | Planned |
| Evidence bundle + timeline UI | Planned |
| Optional decision layer (risk signal) | Planned |
| Decision benchmark | Planned |

## Demo (3 minutes)

1. Start "Repair failing checkout service".
2. Watch the agent's actual diagnostic commands stream in.
3. See an unauthorized network request denied by policy.
4. Review the proposed diff and approve export.
5. See independent tests pass and the sandbox torn down.

## Quick start (target)

```bash
make setup && make demo
# UI: http://localhost:5173   API: http://localhost:8080
```

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Work packages](docs/WORK_PACKAGES.md)
- [Threat model](docs/THREAT_MODEL.md)
- [Evaluation](docs/EVALUATION.md)
- [Demo script](docs/DEMO_SCRIPT.md)
- [Decisions](docs/DECISIONS.md)

## Limitations (fill in as they become true)

- Container isolation is weaker than microVM isolation; the backend in use is displayed in the UI for each run.
- Results are on a small fixed scenario set; see `results/`.
