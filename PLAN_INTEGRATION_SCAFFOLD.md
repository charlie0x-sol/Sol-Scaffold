# Project Plan: Integration Test Scaffold & Relayer for `sol-scaffold`

## 1. Executive Summary

This document outlines the plan to extend `sol-scaffold` with a new command: `integration` (or `int`). This feature addresses the critical gap between unit testing single programs and full mainnet deployment. It will scaffold a local, high-fidelity integration test environment that enables multi-program simulations (e.g., Flash Loans -> Swap -> Lend) using a local validator with mainnet forking capabilities.

## 2. Problem Statement

Solana developers currently face significant friction when moving beyond unit tests:
*   **Isolation:** Standard Anchor tests often test programs in isolation, missing side-effects from external protocol interactions (SPL Token, Serum, etc.).
*   **Setup Overhead:** Configuring `solana-test-validator` to load specific programs (`.so` files) and clone mainnet accounts requires complex, manual CLI arguments.
*   **Determinism:** Relying on public devnets is flaky and requires obtaining SOL (faucets). Local validators are faster but hard to configure.

## 3. Proposed Solution

A new CLI command `sol-scaffold integration` that generates a `tests/integration` directory within an existing Anchor project. This directory will contain a self-contained "Test Relayer" harness.

### Key Features
1.  **Interactive Configuration:** Prompts the user to select which external protocols to mock (e.g., "Mock Serum?", "Mock Raydium?").
2.  **The "Relayer" (Validator Manager):** A TypeScript-based process manager that:
    *   Spins up `solana-test-validator`.
    *   Automatically loads shared object (`.so`) files from a `fixtures/` directory.
    *   Clones specified accounts from Mainnet (optional).
    *   Exposes a clean API for test scripts to reset state or mine blocks.
3.  **Scenario Scaffolding:** Generates sample integration tests (e.g., "Token Swap" scenario) to give developers a running start.

## 4. Technical Architecture

### 4.1. The `integration` Command (`src/commands/integration.ts`)
*   **Input:** User selection of protocols.
*   **Action:**
    1.  Checks for `Anchor.toml`.
    2.  Copies `templates/integration` to `tests/integration`.
    3.  Updates `package.json` with a `test:int` script.
    4.  (Optional) Downloads common mock binaries (like a generic SPL-compatible DEX) if requested.

### 4.2. The Scaffolded Template (`templates/integration/`)
The generated structure will look like this:

```text
tests/
└── integration/
    ├── fixtures/              # Binary dumps (.so files) for external programs
    │   └── readme.md          # Instructions on how to dump programs
    ├── scenarios/             # The actual integration tests
    │   └── basic-swap.test.ts
    ├── utils/
    │   ├── validator.ts       # THE RELAYER: Manages the solana-test-validator process
    │   └── setup.ts           # Helpers: Airdrop, Create Mint, etc.
    └── runner.ts              # Main entry point to run tests
```

### 4.3. The "Relayer" Logic (`validator.ts`)
This class will wrap `spawn('solana-test-validator', args)`:
*   **Config:** Reads from a simple config object (ports, ledger path).
*   **Args Construction:** Dynamically builds the `--bpf-program` and `--clone` arguments based on the contents of `fixtures/` and user config.
*   **Lifecycle:** Ensures the validator is killed when tests finish (handling `SIGINT`/`SIGTERM`).

## 5. Implementation Phases

### Phase 1: Template Development (The "Product")
*   **Goal:** Create a manually working version of the `templates/integration` folder.
*   **Tasks:**
    *   Write `validator.ts` to successfully start/stop a validator.
    *   Write `setup.ts` with helpers for `createTokenMint`, `createUser`, `fundUser`.
    *   Create a dummy `.so` (or use a standard SPL token program) to verify loading works.
    *   Write `basic-swap.test.ts` using the local validator.

### Phase 2: CLI Command Logic
*   **Goal:** detailed logic to inject the template.
*   **Tasks:**
    *   Implement `src/commands/integration.ts`.
    *   Use `inquirer` to ask: "Do you want to enable Mainnet Forking? (Requires RPC URL)".
    *   Implement file copying and variable replacement (if any).

### Phase 3: Integration & Polish
*   **Goal:** Seamless user experience.
*   **Tasks:**
    *   Update `package.json` injection logic to be safe (read, parse, modify, write).
    *   Add a "Downloader" utility to fetch common program binaries (e.g., from a CDN or direct from Solana mainnet using `solana program dump`) so the `fixtures` folder isn't empty.

## 6. User Experience Walkthrough

1.  **User runs:** `sol-scaffold integration` inside their project.
2.  **Prompt:** "Select protocols to mock: [ ] Raydium [ ] Serum [x] SPL Token (Standard)"
3.  **Prompt:** "Enable Mainnet Forking? (Useful for composing with live programs) [y/N]"
4.  **Output:**
    *   Creates `tests/integration/...`
    *   Adds `test:int` to `package.json`.
    *   (If selected) Downloads `serum_dex.so` to `tests/integration/fixtures/`.
5.  **User runs:** `npm run test:int`
    *   The "Relayer" starts up a local validator on port 8899.
    *   Loads the downloaded programs.
    *   Runs the `scenarios/*.test.ts`.
    *   Shuts down cleanly.

## 7. Success Metrics
*   **Reliability:** The test runner must reliably start and *stop* the validator (no zombie processes).
*   **Speed:** Startup time for the test harness should be < 5 seconds (excluding initial download).
*   **Ease of Use:** A developer should be able to run their first integration test within 1 minute of running the command.
