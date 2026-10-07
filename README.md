# UI: http://localhost:5173   API: http://localhost:8080

> **Maturity:** Fully functional E2E Portfolio Project
> Can an AI agent fix a service while the platform prevents it from exceeding its authority?

## The Problem
Modern distributed systems and AI agents require robust operational scaffolding. Simple CRUD apps or mock loops fail when subjected to real-world edge cases, asynchronous boundaries, and security constraints.

## The Solution
An isolated execution platform for AI agents. An agent is given a broken service and a bounded toolset inside a disposable sandbox. Every command passes through policy, risky actions need human approval, results are verified by independent tests, and the whole run leaves a sanitized evidence bundle.

## 💻 Tech Stack
- **Core Technology**: TypeScript, Node.js, Docker
- **Architecture**: Microservices, Event-Driven

## 📚 Documentation
- [Architecture](docs/ARCHITECTURE.md) — System diagram and component details
- [Runbook](docs/RUNBOOK.md) — Setup, commands, and expected outputs
- [Demo](docs/DEMO_SCRIPT.md) — Walkthrough scenario

## 🚀 Step-by-Step Setup

```bash
# 1. Clone the repository
git clone https://github.com/SumitDalavi/agent-sandbox-platform.git
cd agent-sandbox-platform

# 2. Build and start
make setup
make dev
```

## 💻 Usage & Demo
See the [DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) for the interactive walkthrough and verification steps.

## ✅ Verification

| Check | Command | Expected |
|-------|---------|----------|
| Build | `make setup` | Dependencies install successfully |
| Run | `make dev` | Services start without crashing |

## Capability Status
| Capability | Status |
|---|---|
| Sandbox lifecycle API (create/exec/snapshot/destroy) | Implemented |
| Container backend (hardened) | Implemented |
| MicroVM backend (Firecracker) | Planned (stretch; requires KVM host) |
| Policy engine (allowlists, limits) | Implemented |
| Agent loop with real model calls | Implemented |
| Human approval gate | Implemented |
| Independent verification | Implemented |
| Evidence bundle + timeline UI | Implemented |
| Optional decision layer (risk signal) | Implemented |
| Decision benchmark | Implemented |

## Demo (3 minutes)

1. Start "Repair failing checkout service".
2. Watch the agent's actual diagnostic commands stream in.
3. See an unauthorized network request denied by policy.
4. Review the proposed diff and approve export.
5. See independent tests pass and the sandbox torn down.

## Quick start (target)

```bash
make setup && make demo
```

## 👨‍💻 Author
**Sumit Dalavi** — Senior DevSecOps / Platform Engineer
[GitHub](https://github.com/SumitDalavi) | [LinkedIn](https://in.linkedin.com/in/sumit-dalavi-762838129)

---
*Built with a focus on robust patterns, not toy demos.*
