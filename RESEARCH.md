# Research for `sol-scaffold` Improvement Plan

## 1. Project Goal

The `sol-scaffold` project is a CLI tool intended to simplify the creation of new Solana DeFi applications by generating boilerplate code for various primitives like token swaps, lending, and staking. The goal is to lower the barrier to entry for Solana development.

## 2. Existing Artifacts

### `GEMINI.md` (Original Project Plan)

*   **Objective:** Create a "one-click" scaffolding tool.
*   **Features:**
    *   Generate code for Token Swap, Lending/Borrowing, Staking/Yield Farming.
    *   Each template includes an Anchor program (Rust), tests (TypeScript/Mocha), and a Next.js frontend.
*   **Tech Stack:** Node.js, TypeScript, `commander.js`, Rust, Anchor, Next.js.
*   **Phases:**
    1.  Core CLI setup.
    2.  Template creation.
    3.  Integration and testing.
    4.  Documentation and release.

### `package.json`

*   **Name:** `sol-scaffold`
*   **Dependencies:** `commander`, `fs-extra`, `ts-node`, `typescript`.
*   **Scripts:** `start`, `build`, `test` (the test script is a placeholder).
*   **Entry Point:** `dist/index.js` (references a compiled output).

### `src/index.ts` (Current Implementation)

*   **Framework:** `commander.js` is used to define the CLI command.
*   **Command:** `new <primitive> <name>`
*   **Logic:**
    *   It takes `primitive` and `name` as arguments.
    *   It constructs a path to a `templates` directory.
    *   It uses `fs-extra.copy` to copy the template directory to the destination.
*   **Shortcomings:**
    *   **Hardcoded Paths:** The path to the `templates` directory is calculated relative to the current file (`__dirname`). This is brittle and will likely fail when the package is installed globally via npm.
    *   **No Customization:** The tool only copies files. It does not customize them with the provided project name (e.g., updating `package.json` in the new project).
    *   **No Interactivity:** It relies purely on command-line arguments. There are no prompts to guide the user.
    *   **No Dependency Installation:** The user must manually run `npm install` after the project is created.
    *   **Minimal Error Handling:** A simple `try...catch` block with `console.error` is used.
    *   **No Tests:** The `package.json` shows no testing framework is set up for the CLI tool itself.

## 3. Synthesis and Opportunity

The current implementation is a minimal proof-of-concept that fulfills the most basic requirement of copying files. However, it lacks the robustness, user-friendliness, and completeness envisioned in the original `GEMINI.md` plan.

The key opportunity is to evolve the tool from a simple file-copying script into a professional-grade CLI that provides a seamless user experience. This involves adding interactivity, dynamic path resolution, project customization, and automated post-generation steps.
