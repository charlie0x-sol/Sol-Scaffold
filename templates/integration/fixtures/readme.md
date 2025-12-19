# Program Fixtures

Place your Solana program binaries (`.so` files) in this directory.

The `TestRelayer` can be configured to automatically load these into the local validator.

## How to get a program dump from Mainnet

Use the Solana CLI to dump a program's executable data:

```bash
solana program dump <PROGRAM_ID> tests/integration/fixtures/<NAME>.so
```

Example (Serum V3):
```bash
solana program dump 9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin tests/integration/fixtures/serum_dex_v3.so
```

## Loading in Tests

In your `TestRelayer` config:

```typescript
const relayer = new TestRelayer({
  programs: [
    { 
      programId: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 
      deployPath: 'tests/integration/fixtures/serum_dex_v3.so' 
    }
  ]
});
```
