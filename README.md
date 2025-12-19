# sol-scaffold

**The ultimate CLI for bootstrapping production-ready Solana DeFi applications.**

`sol-scaffold` is more than just a template generator; it's a comprehensive development suite designed to take you from "idea" to "tested integration" in minutes.

## 🛠 The Toolkit

We organize our tools into three pillars to support your entire development lifecycle:

| Pillar | Command | Description |
| :--- | :--- | :--- |
| **1. Blueprints** | `sol-scaffold new` | Scaffold fully-featured DeFi primitives (Smart Contract + UI + Tests). |
| **2. Test Suite** | `sol-scaffold integration` | Inject a mainnet-forking integration test environment into your project. |
| **3. Utilities** | `doctor`, `sync`, `clean` | Essential tools to keep your workspace healthy and synchronized. |

---

## 🚀 Getting Started

### Installation

```bash
npm install -g sol-scaffold
```

### Quick Verify
Ensure your environment is ready for Solana development:
```bash
sol-scaffold doctor
```

---

## 🏗 Pillar 1: DeFi Blueprints

Don't start from an empty folder. Generate a working, full-stack dApp with one command.

```bash
sol-scaffold new <blueprint> <project-name>
```

### Available Blueprints

*   **`swap`**
    *   *What it is:* An AMM-style token swap protocol.
    *   *Includes:* Liquidity pools, swap logic, slippage handling.
*   **`lending`**
    *   *What it is:* A collateralized lending and borrowing platform.
    *   *Includes:* Deposits, collateral management, borrowing limits, interest accrual.
*   **`staking`**
    *   *What it is:* A reward-based staking system.
    *   *Includes:* Staking pools, reward calculation per block/second, claiming logic.
*   **`governance`**
    *   *What it is:* A complete DAO infrastructure.
    *   *Includes:* Proposal creation, weighted voting (SPL tokens), execution thresholds.

### What You Get
Every new project includes:
- **Rust/Anchor Program:** Well-commented, safe, and idiomatic smart contract code.
- **Next.js Frontend:** A React UI pre-wired to interact with your specific program.
- **Unit Tests:** TypeScript tests covering the core logic.

---

## 🧪 Pillar 2: The Integration Test Suite

Unit tests aren't enough. Use our **Integration Relayer** to test your program against real-world conditions without deploying to Devnet.

Run this inside **any** Anchor project (even ones you didn't create with sol-scaffold):

```bash
sol-scaffold integration
```

### Features
*   **Mainnet Forking:** Clone the state of real accounts and programs from Mainnet Beta to your local validator.
*   **Protocol Mocks:** Automatically download and load binaries for **Serum**, **Raydium**, **Pyth**, and **Metaplex** to test composability.
*   **The Relayer:** A TypeScript harness that manages the local validator lifecycle for you.

**Run your integration tests:**
```bash
npm run test:int
```

---

## 🧰 Pillar 3: Developer Utilities

Helper commands to save you time.

*   **`sol-scaffold sync`**
    *   *Problem:* You build your program, and the Program ID changes. You have to update `lib.rs`, `Anchor.toml`, and your frontend config.
    *   *Solution:* Run `sync` to automatically propagate the new ID to all those files.

*   **`sol-scaffold clean`**
    *   *Problem:* Rust `target/` directories and `node_modules` take up GBs of space.
    *   *Solution:* Run `clean` to recursively wipe build artifacts from your project.

*   **`sol-scaffold list`**
    *   See all available blueprints and their descriptions.

---

## Contributing

We love open source!
- **Issues:** Found a bug? [Open an issue](https://github.com/gemini/sol-scaffold/issues).
- **PRs:** Want to add a new blueprint (e.g., NFT Marketplace)? Submit a PR!
