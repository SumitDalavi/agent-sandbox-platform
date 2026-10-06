# AGENTS.md: instructions for coding agents

## Mission
Build `agent-sandbox-platform` per `docs/`. The product demonstrates controlled AI execution: isolation, policy, approval, verification, evidence.

## Read first
`docs/ARCHITECTURE.md`, `docs/THREAT_MODEL.md`, the work package you were assigned, `shared/CLAIMS_AND_HONESTY_POLICY.md`, `shared/DEFINITION_OF_DONE.md`.

## Hard rules
1. Security controls are enforced in code, in the sandbox service, not in prompts. Never rely on the model to obey.
2. Deny by default. Network egress, filesystem mounts, and capabilities are allowlisted.
3. The agent never receives real credentials. Only fake, scoped fixtures.
4. The agent's claim of success is never trusted; the independent verifier decides.
5. Label the active backend (`container` or `microvm`) in API responses, UI, and evidence bundles.
6. Never hard-code model responses outside `scenarios/cassettes/` and always show REPLAY badges for them.
7. No unmeasured numbers in docs.

## Layout
```text
contracts/            JSON Schema + OpenAPI (source of truth for interfaces)
services/api/         TypeScript: task API, run orchestration, SSE stream, approvals
services/agent-worker/TypeScript: model adapter + tool loop
services/sandboxd/    Go: sandbox lifecycle, backends (container, microvm), egress proxy control
services/policy/      TypeScript (or Go): policy evaluation library + CLI
services/verifier/    Go or TS: runs independent tests in a fresh sandbox
apps/ui/              React: timeline, diff viewer, approval panel
scenarios/            broken services, cassettes, decision cases
deploy/               compose, seccomp/AppArmor profiles, firecracker assets
results/              eval outputs
```

## Commands
`make setup | dev | test | e2e | lint | eval | demo | clean`

## Conventions
See `shared/CONVENTIONS.md`. One work package per PR; IDs look like `SBX-07`.

## When unsure
Stop and write the question in the PR description or `docs/progress/<WP-ID>.md`. Do not invent security-relevant behavior.
