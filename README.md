# Agent Sandbox Platform

[![CI Pipeline](https://github.com/SumitDalavi/agent-sandbox-platform/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/SumitDalavi/agent-sandbox-platform/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/SumitDalavi/agent-sandbox-platform?color=0969da&label=release&logo=github)](https://github.com/SumitDalavi/agent-sandbox-platform/releases)
[![Release Workflow](https://github.com/SumitDalavi/agent-sandbox-platform/actions/workflows/release.yml/badge.svg)](https://github.com/SumitDalavi/agent-sandbox-platform/actions/workflows/release.yml)
[![SBOM](https://img.shields.io/badge/SBOM-SPDX%202.3-blueviolet?logo=spdx)](https://github.com/SumitDalavi/agent-sandbox-platform/releases/tag/v0.2.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> Containerized runtime sandbox orchestrator built with TypeScript/Node.js and Dockerode, enforcing ephemeral container isolation, execution timeout deadlines, and Model Context Protocol (MCP) server support for Glama.ai and Smithery.ai.

---

## Key Capabilities & Architectural Highlights
- **Model**: Context Protocol (MCP) server integration for Glama.ai, Smithery.ai, Claude Desktop, and Cursor
- **Non-root**: ephemeral container execution (UID 1000) with ReadonlyRootfs and CapDrop ALL
- **Hard**: 5-second deadline clock with guaranteed synchronous container destruction
- **Full**: OCI container distribution via GitHub Container Registry (GHCR)

## Technology Stack
- **Languages & Frameworks:** TypeScript, Node.js 22, Dockerode, Model Context Protocol (MCP), Docker
- **Container Registry:** `ghcr.io/sumitdalavi/agent-sandbox-platform:v0.2.0`
- **License:** MIT Open Source

---

## Documentation Index
- [Architecture Specification](docs/ARCHITECTURE.md) — Detailed system diagrams, state machines, and design contracts.
- [Production Runbook](docs/RUNBOOK.md) — Deployment instructions, configuration options, and operations.
- [Demo Script & Walkthrough](docs/DEMO_SCRIPT.md) — Step-by-step verification scenario.
- [Changelog](CHANGELOG.md) — Full release notes and version history.

---

## Quickstart & Installation

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
git clone https://github.com/SumitDalavi/agent-sandbox-platform.git
cd agent-sandbox-platform
make setup
make test
```

---

## Release & Security Verification

This repository adheres to the Portfolio Release Standard with verifiable supply-chain security attestations:

- **Distribution Archive:** `agent-sandbox-platform-v0.2.0.tar.gz`
- **SHA-256 Digest:** `7dd742df9837a004857f65332d776906b8ef888b90a5bbde8fd33d0b198be3ea`
- **Software Bill of Materials (SBOM):** Anchore SPDX 2.3 JSON specification (`sbom.spdx.json`).

### Verification Commands
```bash
# 1. Download Release Bundle & Checksums
gh release download v0.2.0 --repo SumitDalavi/agent-sandbox-platform --pattern "*.tar.gz" --pattern "checksums.txt"

# 2. Verify Cryptographic Integrity
sha256sum -c checksums.txt

# 3. Inspect SPDX SBOM
gh release download v0.2.0 --repo SumitDalavi/agent-sandbox-platform --pattern "sbom.spdx.json"
cat sbom.spdx.json | jq .spdxVersion
```

---

## License
MIT License. Copyright (c) 2026 Sumit Dalavi.
