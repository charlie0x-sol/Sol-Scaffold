# Solana Governance DAO

This is a feature-complete Governance DAO primitive built on Solana using the Anchor framework.

## Features

- **DAO Initialization**: Configure your DAO with custom voting periods and thresholds.
- **Proposal Management**: Create on-chain proposals for community voting.
- **Weighted Voting**: Vote using SPL-tokens as voting power.
- **Modern UI**: Polished Next.js dashboard with voting progress and proposal management.

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Start a local validator** (in a separate terminal):
    ```bash
    solana-test-validator
    ```

3.  **Build and deploy**:
    ```bash
    anchor build && anchor deploy
    ```

4.  **Run tests**:
    ```bash
    anchor test
    ```

5.  **Run the frontend**:
    ```bash
    cd app
    npm install
    npm run dev
    ```
