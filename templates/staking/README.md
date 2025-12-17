# Solana Staking dApp

This is a basic staking dApp built on Solana.

## Getting Started

1.  Install the dependencies:

    ```bash
    npm install
    ```

2.  Start the local Solana validator:

    ```bash
    solana-test-validator
    ```

3.  Build and deploy the Anchor program:

    ```bash
    anchor build && anchor deploy
    ```

4.  Run the tests:

    ```bash
    anchor test
    ```

5.  Start the frontend:

    ```bash
    cd app && npm run dev
    ```
