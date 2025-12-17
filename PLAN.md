# Plan: `sol-scaffold` CLI Enhancement

This document outlines the plan to refactor and enhance the `sol-scaffold` command-line tool. The goal is to evolve it from a basic script into a robust, user-friendly, and maintainable developer utility.

## 1. Project Goals

*   **Primary Goal:** Create a professional-grade CLI tool that reliably scaffolds new Solana dApps from a set of predefined templates.
*   **User Experience:** The tool should be interactive, intuitive, and provide clear feedback to the user throughout the process.
*   **Developer Experience:** The codebase should be clean, well-documented, testable, and easy for new contributors to understand and extend.

## 2. Key Areas for Improvement

Based on the research, the following areas need to be addressed:

1.  **Brittle File Paths:** The current implementation uses hardcoded relative paths to locate templates, which will break upon installation. This needs to be replaced with a dynamic and reliable path resolution mechanism.
2.  **Lack of Interactivity:** The CLI currently requires all arguments upfront. It should be interactive, prompting the user for necessary information like project name and template choice.
3.  **No Project Customization:** The tool only copies template files. It does not customize them (e.g., setting the project name in the new `package.json`), leaving manual work for the user.
4.  **No Post-Generation Steps:** The user is required to manually install dependencies after the project is created. The CLI should handle this automatically.
5.  **Insufficient Error Handling & Feedback:** The tool has minimal error handling and lacks clear, informative feedback for the user.
6.  **Absence of Tests:** The project lacks any form of automated testing, making it difficult to refactor or add new features confidently.

## 3. Detailed Implementation Plan

### Phase 1: Core CLI Refactoring & Interactivity

*   **Objective:** Replace the basic `commander.js` implementation with a more robust and interactive setup.
*   **Tasks:**
    1.  **Integrate `inquirer`:** Add the `inquirer` library to manage interactive command-line prompts.
    2.  **Refactor `new` Command:** Modify the `new` command to:
        *   Prompt the user for the desired primitive (e.g., `swap`, `lending`, `staking`).
        *   Prompt for the new project name.
    3.  **Add `chalk`:** Integrate the `chalk` library for colored and more readable console output (e.g., for success messages, errors, and instructions).
    4.  **Structure Code:** Reorganize the code into logical modules (e.g., `commands`, `utils`) to improve maintainability.

### Phase 2: Dynamic Templating & Customization

*   **Objective:** Implement a robust system for finding, copying, and customizing the project templates.
*   **Tasks:**
    1.  **Dynamic Path Resolution:** Implement a function that reliably locates the `templates` directory, whether the tool is run locally or as a globally installed package.
    2.  **Template Copying Logic:** Create a dedicated module for file operations that copies the selected template to the user's specified destination.
    3.  **Introduce Placeholders:** Update the template files (e.g., `package.json`, `README.md`) to use a templating syntax for placeholders (e.g., `<%= projectName %>`).
    4.  **Implement Customization:** After copying, the CLI will read the newly created files and replace the placeholders with the user-provided values.

### Phase 3: Automated Setup & User Guidance

*   **Objective:** Automate the final setup steps and provide clear instructions to the user.
*   **Tasks:**
    1.  **Automated Dependency Installation:** Add functionality to automatically run `npm install` (or `yarn`/`pnpm` if detected) within the newly generated project directory. This can be done using `child_process`.
    2.  **Display Final Instructions:** Upon successful project creation and dependency installation, display a clear message to the user outlining the next steps (e.g., `cd my-new-dapp`, `npm run start`).

### Phase 4: Testing, Documentation & Publishing Prep

*   **Objective:** Ensure the tool is reliable, well-documented, and ready for distribution.
*   **Tasks:**
    1.  **Set up Testing Framework:** Integrate a testing framework like `jest` to test the CLI's logic.
    2.  **Write Unit Tests:** Create unit tests covering:
        *   Command handling and user input.
        *   Template path resolution.
        *   Project customization (placeholder replacement).
    3.  **Update `README.md`:** Thoroughly document the CLI's features, commands, and usage instructions in the main `README.md` file.
    4.  **Prepare for Publishing:** Ensure `package.json` is correctly configured for publishing to npm (e.g., `bin`, `files` fields).

## 4. Success Metrics

*   The CLI can be installed globally via `npm`.
*   Running `sol-scaffold new` triggers an interactive session.
*   A new project can be successfully generated, customized, and its dependencies installed in a single command.
*   The generated project is fully functional and runs without manual changes.
*   The CLI has a meaningful test suite with >80% coverage.