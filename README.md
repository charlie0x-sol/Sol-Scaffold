# sol-scaffold

A powerful CLI tool to scaffold common DeFi primitives on the Solana blockchain, helping you bootstrap your dApp development in seconds.

## Installation

```bash
npm install -g sol-scaffold
```

## Usage

### Commands

*   `sol-scaffold new`: Create a new project (interactive or with arguments).
*   `sol-scaffold list`: List all available DeFi primitives.
*   `sol-scaffold doctor`: Check if you have all necessary tools installed (Solana, Anchor, Rust, etc.).
*   `sol-scaffold clean`: Recursively remove build artifacts (`node_modules`, `target`, etc.) to free up disk space.
*   `sol-scaffold sync`: Automatically sync Program IDs from `target/deploy` to `lib.rs`, `Anchor.toml`, and the frontend code.

### Creating a New Project (Interactive Mode)

You will be prompted to:
1.  **Select a DeFi primitive:** Choose from `swap`, `lending`, `staking`, or `governance`.
2.  **Name your project:** Provide a name for your new dApp.

### Command Line Arguments

You can also provide arguments directly to skip the prompts:

```bash
sol-scaffold new <primitive> <project-name> [options]
```

**Options:**

*   `-d, --dry-run`: Preview changes (file creation, variable replacements) without modifying the disk.
*   `--git`: Initialize a git repository in the new project.
*   `--no-install`: Skip automatic dependency installation.

**Examples:**

```bash
# Scaffold a feature-complete DAO
sol-scaffold new governance my-dao

# Scaffold a token swap dApp
sol-scaffold new swap my-swap-dapp

# Scaffold a staking dApp
sol-scaffold new staking my-staking-dapp

# Sync program IDs after a fresh build
sol-scaffold sync

# Clean up space in a project
sol-scaffold clean my-dao
```

## Available Templates

*   **Swap:** A basic AMM-style token swap implementation.
*   **Lending:** A simple lending and borrowing protocol with collateral management.
*   **Staking:** A template for staking tokens to earn rewards.
*   **Governance:** A feature-complete DAO primitive with proposals and weighted voting.

## Generated Project Structure

Each generated project comes fully configured with:

*   **Smart Contracts:** `programs/` contains the Anchor program in Rust.
*   **Tests:** `tests/` includes TypeScript tests using Mocha/Chai.
*   **Frontend:** `app/` is a Next.js frontend pre-wired to interact with your dApp.
*   **Configuration:** `Anchor.toml` and `package.json` are set up and ready to go.

## Getting Started with Your New Project

Once your project is generated, follow these steps:

1.  **Navigate to the project directory:**
    ```bash
    cd <project-name>
    ```

2.  **Build the Anchor program:**
    ```bash
    anchor build
    ```

3.  **Deploy to your local validator:**
    Make sure `solana-test-validator` is running in a separate terminal.
    ```bash
    anchor deploy
    ```

4.  **Run the tests:**
    ```bash
    anchor test
    ```

5.  **Start the frontend:**
    ```bash
    cd app
    npm install
    npm run dev
    ```

## Contributing

Contributions are welcome!

- If you have a feature request or bug report, please [open an issue](https://github.com/gemini/sol-scaffold/issues).
- If you would like to contribute code, please open a [pull request](https://github.com/gemini/sol-scaffold/pulls).