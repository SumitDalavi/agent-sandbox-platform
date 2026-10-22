# Agent Sandbox Platform

[![CI Pipeline](https://github.com/SumitDalavi/agent-sandbox-platform/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/SumitDalavi/agent-sandbox-platform/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/SumitDalavi/agent-sandbox-platform?color=0969da&label=release&logo=github)](https://github.com/SumitDalavi/agent-sandbox-platform/releases)
[![Release Workflow](https://github.com/SumitDalavi/agent-sandbox-platform/actions/workflows/release.yml/badge.svg)](https://github.com/SumitDalavi/agent-sandbox-platform/actions/workflows/release.yml)
[![SBOM](https://img.shields.io/badge/SBOM-SPDX%202.3-blueviolet?logo=spdx)](https://github.com/SumitDalavi/agent-sandbox-platform/releases/tag/v0.2.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> Distributed via GitHub Container Registry (`ghcr.io/sumitdalavi/agent-sandbox-platform:v0.2.0`) and tagged GitHub Releases with Anchore SPDX 2.3 SBOM and SHA-256 digest attestation.

---

## The Problem
Modern distributed systems and AI agents require robust operational scaffolding. Simple CRUD apps or mock loops fail when subjected to real-world edge cases, asynchronous boundaries, and security constraints.

## The Solution
An isolated execution platform for AI agents. An agent is given a broken service and a bounded toolset inside a disposable sandbox. Every command passes through policy, risky actions need human approval, results are verified by independent tests, and the whole run leaves a sanitized evidence bundle.

---

## Key Capabilities & Architectural Highlights
- **Model Context Protocol (MCP)**: Server integration for Glama.ai, Smithery.ai, Claude Desktop, and Cursor.
- **Non-root Execution**: Ephemeral container execution (UID 1000) with ReadonlyRootfs and CapDrop ALL.
- **5-Second Hard Deadline**: Guaranteed synchronous container purge on timeout or completion.
- **Full OCI Distribution**: Published to GitHub Container Registry (GHCR).

## 💻 Tech Stack
- **Container Registry:** `ghcr.io/sumitdalavi/agent-sandbox-platform:v0.2.0`
- **Security & Attestation:** Anchore SPDX 2.3 SBOM, SHA-256 Checksums
- **License:** MIT Open Source

---

## 📚 Documentation Index
- [Architecture Specification](docs/ARCHITECTURE.md) — System diagram, component contracts, and container distribution architecture.
- [Production Runbook](docs/RUNBOOK.md) — Operational runbook, live execution commands, and verification recipes.
- [Demo Walkthrough](docs/DEMO_SCRIPT.md) — Step-by-step interactive demonstration scenario.
- [Changelog](CHANGELOG.md) — Full version history following Keep a Changelog and SemVer.

---

## 🚀 Quickstart & Installation

### Option 1: Run with Docker Container (GHCR)
```bash
docker pull ghcr.io/sumitdalavi/agent-sandbox-platform:v0.2.0
docker run -d -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock ghcr.io/sumitdalavi/agent-sandbox-platform:v0.2.0
```

### Option 2: Run as Model Context Protocol (MCP) Server
Available on [Glama.ai](https://glama.ai/mcp) and [Smithery.ai](https://smithery.ai/):
```bash
# Smithery one-line install:
npx -y @smithery/cli install SumitDalavi/agent-sandbox-platform --client claude

# Local client spec (.mcp.json):
{
  "mcpServers": {
    "agent-sandbox": {
      "command": "node",
      "args": ["mcp-server.js"]
    }
  }
}
```

### Option 3: Local Developer Setup
```bash
# 1. Clone the repository
git clone https://github.com/SumitDalavi/agent-sandbox-platform.git
cd agent-sandbox-platform

# 2. Build and start
make setup
make dev
```

---

## 🎮 Usage & Demo
See [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) for the interactive walkthrough and verification steps.

## Demo (3 minutes)

1. Start "Repair failing checkout service".
2. Watch the agent's actual diagnostic commands stream in.
3. See an unauthorized network request denied by policy.
4. Review the proposed diff and approve export.
5. See independent tests pass and the sandbox torn down.

---

## ✅ Verification

### Operational Verification
| Check | Command | Expected |
|---|---|---|
| Build | `make setup` | Dependencies install successfully |
| Run | `make dev` | Services start without crashing |
| Test | `make test` | Behavioral test suite passes |

### Cryptographic & Supply Chain Verification
To verify the authentic origin, integrity, and software composition of release artifacts:
```bash
# 1. Download Release Bundle & Checksums
gh release download v0.2.0 --repo SumitDalavi/agent-sandbox-platform --pattern "*.tar.gz" --pattern "checksums.txt"

# 2. Verify SHA-256 Digest
sha256sum -c checksums.txt

# 3. Inspect SPDX 2.3 Software Bill of Materials
gh release download v0.2.0 --repo SumitDalavi/agent-sandbox-platform --pattern "sbom.spdx.json"
cat sbom.spdx.json | jq .spdxVersion
```

---

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

---

## 🔌 Dual-Mode Execution: Live-First with Graceful Mock Fallback

This platform operates in **Dual-Mode**, dynamically selecting between live container execution and self-contained policy simulation based on environment variables:

| Component | Environment Variable | Live Mode Behavior | Fallback Mode (Unset / Empty) |
|---|---|---|---|
| **Container Engine** | `DOCKER_HOST` / default socket | Launches isolated ephemeral Alpine containers via `/var/run/docker.sock` | Activates behavioral policy simulation when Docker daemon is unavailable |
| **Authentication Gate** | `API_TOKEN` | Enforces enterprise Bearer token validation for all sandbox endpoints | Defaults to `valid-token` for local development |
| **Policy Enforcement** | `POLICY_BLOCKED_TOKENS` | Ingests custom organizational command blacklist (comma-separated) | Enforces default safety tokens (`rm`, `curl`, `wget`, `nc`, `bash`) |
| **Agent Tool Client** | `OPENAI_API_KEY` / `GEMINI_API_KEY` | Connects live autonomous agent loop to external model providers | Runs deterministic diagnostic test scripts against sandbox APIs |


---

## 👨‍💻 Author
**Sumit Dalavi** — Senior DevSecOps / Platform Engineer  
[GitHub](https://github.com/SumitDalavi) | [LinkedIn](https://in.linkedin.com/in/sumit-dalavi-762838129)

---

## 📄 License
This project is licensed under the [MIT License](LICENSE). Copyright (c) 2026 Sumit Dalavi.
