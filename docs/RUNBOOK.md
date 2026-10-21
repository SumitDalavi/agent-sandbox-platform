# Runbook: UI: http://localhost:5173   API: http://localhost:8080

## Prerequisites
- Docker & Docker Compose
- Node.js (v22+) or Python (3.12+) depending on the project
- `make` utility

## Setup
1. **Install dependencies:**
   ```bash
   make setup
   ```
2. **Start the local environment:**
   ```bash
   make dev
   ```

## Common Commands
- `make dev`: Starts the application and observability stack.
- `make test`: Runs the test suite.
- `make clean`: Removes node_modules, builds, and resets Docker volumes.

## Troubleshooting
**Port Conflicts (9090, 3000):**
If `make dev` fails due to bound ports, verify that no local Prometheus or Grafana instance is running. The `docker-compose.yml` can be modified to map to alternate host ports if necessary.

**Build Errors:**
Run `make clean && make setup` to completely clear the cache and reinstall dependencies from scratch.


## October 2026 Update: Behavioral Testing & Runtime Stabilization

**Implementation Notes:**
Refactored test.js to use tsx, implemented Docker boundary execution tests, and verified Sandbox creation/policy rejection endpoints.

* Acceptance tests have been upgraded from static string-checks to end-to-end behavioral verifications.
* API boundaries and execution layers (Docker, WebSockets, Temporal, etc.) are now explicitly exercised in tests.


## Phase 4: Structural Epics & Architectural Roadmap

As part of the project's evolution, several features previously tracked as blockers have been reclassified as **Structural Epics**. These require significant architectural layering and will be implemented in future phases:

* **Epic 1: Network & Resource Hardening:** Implementation of strict network isolation (egress proxies, blocked DNS) and deep resource limits (CPU, memory, time) via cgroups.
* **Epic 2: Advanced Auditing & Policy Engine:** Persistent execution audit logging (tracking who ran what, when, and the outcome) and stateful policy rule persistence.
* **Epic 3: Management Dashboard:** A proper React UI featuring execution history logs and a visual policy editor.


## Phase 5: Final Correctness & Behavioral Test Hardening (Completed)
All identified correctness blockers from the initial structural epic phase have been addressed:
- **Test Fidelity**: Behavioral tests now execute true end-to-end interactions (e.g. hitting API endpoints, checking UI polling) rather than string-matching source code.
- **Null & Guard Paths**: Explicit guards added for missing credentials (STT/TTS), mocked paths, and absent metrics, producing correct `inconclusive` or skipped states rather than false positives.
- **Resource Cleanup**: Tests properly isolate their artifacts (e.g., dedicated `fs.mkdtempSync` directories) and verify underlying cleanup (e.g., Docker container `inspect` checks).
- **Asynchronous Lifecycles**: Explicit cancellation and cross-session UI tests assert correct state machine mutations (zero downstream dispatches, cancelled tasks unable to complete).
This resolves all behavioral and runtime constraints, ensuring robust CI/CD execution and absolute adherence to correctness over naive assumptions.

## Phase 6: Operational Parity & Failure Propagation (Final Validation)
- **Multi-Launcher Parity**: The test framework now explicitly validates behavior under both `ts-node` and `tsx` TS execution launchers. This guarantees reliable integration in diverse CI environments without hidden ESM/CJS or memory-leak discrepancies.
- **Simulated Cleanup Failure**: Introduced a diagnostic `/api/sandbox/:id/simulate-cleanup-failure` endpoint. The platform now rigorously proves its failure-propagation capabilities, correctly reporting orphaned containers and unrecoverable states back to the orchestrator instead of swallowing underlying Docker faults.


## Production Operations & Release Runbook (v0.2.0 Update)

### 1. Production Container Invocation (GHCR)
```bash
# Pull production image:
docker pull ghcr.io/sumitdalavi/agent-sandbox-platform:v0.2.0

# Run container with Docker daemon socket access:
docker run -d \
  --name agent-sandbox-platform \
  -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/sumitdalavi/agent-sandbox-platform:v0.2.0

# Verify platform API:
curl -f http://localhost:3000/api/health
```

### 2. Model Context Protocol (MCP) Server Setup
Available on Glama.ai and Smithery.ai for autonomous agent tool-calling:
```bash
# One-line automated install for Claude Desktop via Smithery:
npx -y @smithery/cli install SumitDalavi/agent-sandbox-platform --client claude

# Run directly via stdio MCP transport:
node mcp-server.js

# Claude Desktop / Cursor manual JSON configuration (.mcp.json):
{
  "mcpServers": {
    "agent-sandbox": {
      "command": "node",
      "args": ["mcp-server.js"]
    }
  }
}
```

### 3. Release Integrity & Verification Runbook
To verify the authentic origin and file integrity of release packages:
```bash
# Download distribution package and checksums:
gh release download v0.2.0 --repo SumitDalavi/agent-sandbox-platform --pattern "*.tar.gz" --pattern "checksums.txt"

# Assert cryptographic match:
sha256sum -c checksums.txt

# Inspect SPDX 2.3 Software Bill of Materials:
gh release download v0.2.0 --repo SumitDalavi/agent-sandbox-platform --pattern "sbom.spdx.json"
cat sbom.spdx.json | jq .packages[0].name
```

### 4. Operational Failure Modes & Troubleshooting
- **Port Collisions:** If the host port is in use, remap using `-p <ALTERNATIVE_PORT>:<CONTAINER_PORT>`.
- **Docker Daemon Permissions:** For tools requiring container orchestrator control (`agent-sandbox-platform`), ensure `/var/run/docker.sock` has read/write permissions for the runner user.
- **GHCR Pull Authentication:** If pulling from GHCR encounters rate limits or private scope:
  ```bash
  echo "$GITHUB_TOKEN" | docker login ghcr.io -u <GITHUB_USERNAME> --password-stdin
  ```
