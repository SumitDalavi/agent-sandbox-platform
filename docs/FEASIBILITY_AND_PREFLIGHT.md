# Feasibility and Preflight — Agent Sandbox Platform (SBX)

## Purpose
Before any implementation begins, verify that all prerequisites are met. Record a GO or HOLD decision.

## Hardware and environment
- [ ] Docker / container runtime installed and functional
- [ ] KVM host available (for microVM / Firecracker stretch goal only)
- [ ] Node.js 22+ installed
- [ ] Go 1.23+ installed
- [ ] Python 3.12+ with `uv` available (for eval scripts)
- [ ] Sufficient disk space for container images (~10 GB)

## Provider access
- [ ] OpenAI-compatible API endpoint accessible (or mock mode confirmed sufficient for MVP)
- [ ] No paid services required for MVP demo (all local)
- [ ] Decision layer provider (Jev/TypeSafe) API access confirmed OR marked optional

## Licenses
- [ ] Firecracker license reviewed (Apache 2.0)
- [ ] All chosen dependencies: license and maintenance status documented in `docs/DECISIONS.md`

## Budget
- [ ] No cloud spending required for local demo
- [ ] GPU access: not required for this project

## Tools
- [ ] `make` available
- [ ] `docker compose` functional
- [ ] `gitleaks` or equivalent secret scanner available
- [ ] Linters: `eslint`, `prettier`, `golangci-lint`, `ruff` installed

## Decision
- [ ] **GO** — all prerequisites met, proceed to SBX-01
- [ ] **HOLD** — blocker identified: _________________
