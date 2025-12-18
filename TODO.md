# TODO

## Phase 1: Core CLI Refactoring & Interactivity

- [x] **Integrate `inquirer`:** Add the `inquirer` library to the project to handle interactive command-line prompts.
- [x] **Integrate `chalk`:** Add the `chalk` library for colored and more readable console output.
- [x] **Structure Code:** Reorganize the code into logical modules (`src/commands`, `src/utils`).
- [x] **Refactor `new` Command:** Modify the `new` command to use `inquirer` and `chalk`.

## Phase 2: Dynamic Templating & Customization

- [x] **Dynamic Path Resolution:** Implement a function that reliably locates the `templates` directory.
- [x] **Template Copying Logic:** Create a dedicated module for file operations that copies the selected template.
- [x] **Introduce Placeholders:** Update the template files to use a templating syntax for placeholders (e.g., `<%= projectName %>`).
- [x] **Implement Customization:** After copying, the CLI will read the newly created files and replace the placeholders with the user-provided values.

## Phase 3: Automated Setup & User Guidance

- [x] **Automated Dependency Installation:** Add functionality to automatically run `npm install` in the newly generated project directory.
- [x] **Display Final Instructions:** Upon successful project creation, display a clear message to the user outlining the next steps.

## Phase 4: Testing, Documentation & Publishing Prep

- [x] **Set up Testing Framework:** Integrate `jest`.
- [x] **Write Unit Tests:** Create unit tests for the core logic.
- [x] **Update `README.md`:** Document the new features and usage.
- [x] **Prepare for Publishing:** Ensure `package.json` is correctly configured.

## Phase 5: Template Enhancements (Completed)

- [x] **Swap Primitive:**
    - [x] Implement Constant Product Market Maker (CPMM) logic in smart contract.
    - [x] Build interactive Swap UI with `@project-serum/anchor` integration.
    - [x] Update tests.
- [x] **Lending Primitive:**
    - [x] Implement Collateral/LTV checks and User Accounts in smart contract.
    - [x] Build Lending Dashboard UI with Deposit/Borrow/Init functions.
    - [x] Update tests.
- [x] **Staking Primitive:**
    - [x] Implement Time-based Reward logic and User Stake tracking.
    - [x] Build Staking Dashboard UI with Stake/Unstake/Init functions.
    - [x] Update tests.

## Phase 6: Modular Scaffolding (Planned)

- [ ] **Add CLI Flags:** Implement `--program-only` and `--frontend-only` in `commander`.
- [ ] **Logic Separation:** Update `copyTemplate` and `customizeDirectory` to handle partial project generation.
- [ ] **Dynamic Instructions:** Update "Next Steps" output based on the selected mode.

## Phase 7: UI & Template Polish (Upcoming)

- [ ] **Tailwind/Shadcn Refactor:** Bring professional UI components to the Pages Router templates.
- [ ] **Add NFT Marketplace:** New comprehensive primitive template.
- [ ] **Add DAO/Governance:** New comprehensive primitive template.