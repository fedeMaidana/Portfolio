---
title: 'ARC'
number: '#006'
category: 'DeveloperApplication'
description: 'Rust command-line security layer for AI agents and scripts: it reviews every action before it runs and decides whether to allow, block or ask for approval.'
repoUrl: 'https://github.com/fedeMaidana/ARC'
tags: ['Rust', 'CLI', 'Security', 'AI Agents']
---

Technical decisions:

### What it is: a gate for actions

ARC —Action Review Controller— is a command-line security layer that sits between an AI agent (or a script, or a tool) and the system. Before an action runs, ARC reviews it and makes one of three decisions: allow, block, or ask for human approval. Separately, it assigns a risk level —low, medium, high or critical— that's independent from the decision: a command can need approval without being dangerous, and the other way around. The full flow is always the same: request → review → decision → audit → safe execution.

### Hexagonal architecture

The project is split into four cleanly separated layers: the _domain_ with the pure decision logic (no disk, no network), the _application_ that orchestrates the review flow through a port, the _infrastructure_ with the concrete adapters (config, executor, audit log, policy engines, agent discovery, shims), and the _interface_ (CLI, JSON API, TUI). The port is a `ReviewEnvironment` trait, and there's a single place in the whole codebase that wires the real infrastructure into that port. The concrete upside is that all the security logic can be tested with pure functions, without spawning processes or touching the file system.

### Two policy engines: native and Rego

ARC ships with a native policy engine written in Rust, but it can also delegate the decision to `Rego`/`OPA` (Open Policy Agent's policy language) if you configure it. The engine is chosen by configuration and both return the same decision structure. The important part is that the Rego engine _fails closed_: if `OPA` isn't installed, takes too long, or returns something ARC can't understand, the default decision is to block with critical risk. In security that's the right call —when in doubt, don't run it— and it's covered by tests.

### Bypass-resistant console policy

For commands, the rules are fine-grained: each command has a policy (allow, ask, or block), each subcommand does too, and arguments can be blocked or require approval. What's interesting is how much work goes into making sure they can't be sidestepped. Paths are normalized before being compared, so a trick like `cat safe/../../.env` doesn't dodge the protected-resources list. Passing the command by absolute or relative path (`/usr/bin/git`, `./git`) doesn't sneak it through as if it were a different command, and chaining text into the subcommand (`git status;push`) is detected and rejected. Everything starts from a _deny-by-default_ stance: whatever isn't explicitly allowed doesn't get through.

### Network protection against SSRF

When an action points to a URL, ARC analyzes it to stop requests to places it shouldn't touch: localhost, private networks, link-local addresses and —key in the cloud— the metadata service at `169.254.169.254`. It blocks by scheme, by host, and by IP ranges (CIDR). This is defense against _SSRF_ (Server-Side Request Forgery: tricking a process into making requests to internal addresses), a classic hole when an agent can fetch arbitrary URLs.

### Strict JSON API for agents

Beyond human use, ARC exposes `arc decide --json`: it reads a request as JSON from standard input and returns a structured response. It's _decision-only_, it never executes anything, so an agent can consult it before acting without any risk. The input is validated strictly —it rejects unknown fields, empty commands, or malformed shapes— and the contract is stable: a fixed API version, machine-readable reason codes, and exit codes an agent can rely on (0 if it allows or asks, 1 if it blocks, 2 if the request is invalid).

### Shims: intercepting the agent without it noticing

This is the cleverest part. To actually get in the middle, ARC installs _launchers_ in a directory that comes first on the `PATH`. When the agent runs a command, it hits the launcher first, which marks where the request came from, prepends a second shims directory to the `PATH`, and only then launches the real binary. That second directory holds `bash` and `sh` shims that route shell commands back through ARC. And here's a strong design choice: instead of trying to parse arbitrary shell, the shim _refuses_ anything with complex syntax —pipes, `;`, `&`, `$`, backticks, redirections—; if it can't reason about it safely, it won't run it. To find what to intercept, ARC scans the `PATH` for known agents (Claude Code, OpenCode, Codex, Gemini and several more) and heuristic candidates, skipping its own directories so it doesn't loop.

### Bounded execution and auditing

When an action is approved and ARC runs it, it does so in a box with limits: by default it clears the environment, caps the output at a maximum number of bytes, and applies a timeout that kills the process if it hangs. And no matter what happens, every decision is recorded in an audit log in JSON Lines format. That log automatically redacts anything that looks sensitive —API keys, passwords, tokens, _bearer_— before writing, trims oversized fields, and, on Unix systems, ends up with permissions restricted to the owner only. The idea is to be able to reconstruct what happened without leaking secrets along the way.

### Thorough tests and CI

Being a security tool, trust matters, so the testing is serious. There are unit, integration and end-to-end tests —including the policy matrix, the bypass cases, the URL parser and the JSON API—, and the end-to-end ones spin up the real binary with isolated temporary directories. CI runs formatting, `Clippy` with warnings treated as errors, and the whole test battery with `cargo-nextest` on every push. The same set of checks can be run locally before committing.
