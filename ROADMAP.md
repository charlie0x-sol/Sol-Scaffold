# Sol-Scaffold Roadmap

This document outlines the planned improvements and future direction for the `sol-scaffold` CLI.

## Phase 1: Core CLI Enhancements (Short Term)

### 1.1 Dynamic Program Renaming
*   **Goal:** Move away from generic names like `solana-swap-dapp`.
*   **Action:** Update the scaffolding logic to rename the Rust crate, program folder, and the `pub mod` declaration in `lib.rs` to match the user's project name (using `snake_case`).
*   **Action:** Automatically update the IDL imports in the frontend to match the new program name.

### 1.2 Git Integration
*   **Goal:** Provide a "ready-to-code" environment.
*   **Action:** Add a `--git` flag (and interactive prompt) to initialize a git repository, create a `.gitignore`, and make an initial "Scaffolded by sol-scaffold" commit.

### 1.3 Package Manager Support
*   **Goal:** Respect developer preferences.
*   **Action:** Detect existing installations of `pnpm` and `yarn`.
*   **Action:** Add a `--package-manager <name>` flag to choose which tool installs dependencies.

## Phase 2: Template Modernization (Mid Term)

### 2.1 Next.js App Router Upgrade
*   **Goal:** Stay current with the React ecosystem.
*   **Action:** Migrate templates from the `pages/` directory to the Next.js `app/` router.
*   **Action:** Implement Server Components where appropriate for better performance.

### 2.2 UI/UX Overhaul
*   **Goal:** Professional-grade boilerplate.
*   **Action:** Integrate `Tailwind CSS` + `Shadcn/UI` into all templates.
*   **Action:** Add a dark mode toggle by default.
*   **Action:** Improve the `WalletAdapter` implementation with more robust error handling and auto-connect.

### 2.3 Expanded Primitive Library
*   **Goal:** Cover more DeFi use cases.
*   **Templates to add:**
    *   **Governance:** Basic DAO with proposal creation and voting.
    *   **NFT Marketplace:** Simple minting and listing logic.
    *   **Airdrop:** Merkle-tree based reward distribution.

## Phase 3: Developer Productivity Tools (Long Term)

### 3.1 Modular Scaffolding
*   **Goal:** Support existing projects.
*   **Action:** Add a `--program-only` flag to generate just the Anchor workspace.
*   **Action:** Add a `--frontend-only` flag to generate a Next.js app that expects an existing IDL.

### 3.2 Key Management Utilities
*   **Goal:** Simplify Program ID rotations.
*   **New Command:** `sol-scaffold update-id`
    *   Generates a new keypair.
    *   Updates `Anchor.toml`.
    *   Updates `declare_id!` in `lib.rs`.
    *   Updates the frontend config.

### 3.3 Dry Run & Templates Preview
*   **Goal:** Transparency before execution.
*   **Action:** Add `--dry-run` to show exactly which files will be created and modified without writing to disk.

---

## Contribution Guidelines
We welcome contributions to any of these phases! Please check the issues page or open a discussion if you want to help implement any of these features.
