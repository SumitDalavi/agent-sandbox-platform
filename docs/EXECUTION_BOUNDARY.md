# Execution Boundary — Agent Sandbox Platform (SBX)

## Purpose
Clarify the precise boundary between what the agent can and cannot do inside the sandbox. This distinction is critical for portfolio credibility.

## The key question
> Does the agent have a restricted execution interface, or can it run arbitrary code inside the sandbox?

These are fundamentally different security properties:
- **Restricted interface**: the agent can only invoke pre-defined commands through a typed API. The platform controls what is possible.
- **Arbitrary code execution**: the agent can run anything inside the sandbox. The platform controls the blast radius (isolation, resource limits, egress).

**Both are valid designs**, but they must be clearly labelled. Command-pattern filtering must not be presented as a complete security boundary while unrestricted interpreters remain available inside the sandbox.

## Egress controls

Hostname allowlisting alone is insufficient. The implementation must:

1. **Validate resolved addresses** — after DNS resolution, check the IP against blocked ranges (private, link-local, metadata endpoints).
2. **Connect to the validated destination** — do not allow the target to redirect to a different host.
3. **Disable or revalidate redirects** — HTTP redirects can bypass hostname allowlists.

Reference: [OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)

### Required test cases
- [ ] IPv4 private range blocked (10.x, 172.16-31.x, 192.168.x)
- [ ] IPv6 loopback and link-local blocked
- [ ] Cloud metadata addresses blocked (169.254.169.254, etc.)
- [ ] HTTP redirect to blocked address denied
- [ ] DNS rebinding (hostname resolves to allowed IP, then changes to blocked IP)
- [ ] Access to internal services on the host network denied

### HTTPS considerations
Document which approach is used:
- **Allowlisted CONNECT tunnel**: client TLS directly to destination. Platform sees hostname but not content. No certificate issues.
- **TLS interception proxy**: platform terminates TLS. Sees content but requires injecting a CA certificate into the sandbox. Certificate trust implications must be documented.

## Artifact export boundary
- The agent may export only the artifacts defined in the run configuration.
- Export size is bounded.
- The verifier validates exported artifacts against expected types/schemas.
- No arbitrary file exfiltration from the sandbox filesystem.

## Teardown guarantee
After any run (success, failure, crash, timeout, kill):
- All sandbox resources (containers, processes, network namespaces, mounts) are cleaned up.
- Test: force-kill a running sandbox and verify no resources leak.
