# Sol-Scaffold Roadmap

This document outlines the progress and future direction of the `sol-scaffold` CLI.

## Current Focus: Phase 3 - CLI Modularization (To be implemented)
*   **Goal:** Allow users to scaffold specific parts of the stack rather than the full suite.
*   **New Flags:**
    *   `--program-only`: Generates only the Anchor workspace (Rust programs, tests, and Anchor.toml).
    *   `--frontend-only`: Generates only the Next.js application, pre-configured with a placeholder for the IDL.
*   **Benefit:** Supports developers who already have an existing program or want to use a different frontend/backend architecture.

## Recently Completed
*   **Dynamic Program Renaming:** CLI now renames Rust crates and folders to match project names.
*   **Git Integration:** Optional `--git` flag for automatic repository initialization.
*   **Stable Frontend Foundation:** Reverted to Next.js 13 (Pages Router) for maximum compatibility with Solana Wallet Adapters.
*   **Doctor Command:** Integrated system health checks for Solana development tools.

## Phase 4: Template Expansion (Upcoming)
*   **NFT Marketplace Template:** Minting, listing, and buying NFTs.
*   **DAO/Governance Template:** Proposal creation and voting logic.
*   **Airdrop Tool:** Merkle-tree based distributions.

## Phase 5: Advanced Tooling
*   **`update-id` command:** Automate Program ID rotation across all files.
*   **Dry Run Mode:** Preview file changes before writing to disk.
*   **Shadcn/UI Integration:** Premium UI components for all templates.