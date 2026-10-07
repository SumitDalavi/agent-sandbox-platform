# Architecture: Agent Sandbox Platform (SBX)

## Overview
SBX provides a secure, isolated execution environment for autonomous agents to run untrusted code. It leverages Docker for isolation and implements an aggressive, tokenized policy engine to block destructive actions before they ever reach the container.

## Components
1. **Sandbox Engine**:
   - Uses `dockerode` to programmatically spin up `alpine` containers.
   - Implements `NetworkMode: none` for strict egress prevention.
   - multiplexes stdout/stderr for real-time execution feedback.
2. **Policy Engine**:
   - Tokenizes incoming shell commands.
   - Denies destructive commands (`rm`, `bash`, `curl`, `wget`) and protected paths (`/etc/shadow`).
3. **API & UI**:
   - An Express backend mapping UI requests to Docker interactions.
   - A modern React-style (Vanilla JS) dashboard for spinning up containers, executing commands, and viewing immutable audit logs.
