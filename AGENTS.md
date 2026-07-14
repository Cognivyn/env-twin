# Agent instructions

## Project contract

env-twin is a TypeScript/ESM CLI for synchronizing keys across `.env*` files.
It creates backups before edits and sanitizes values in `.env.example`. Never
print, copy, or commit real environment values.

## Development workflow

```bash
bun install --frozen-lockfile
bun run build
bun test
bun dist/index.js --help
bun dist/index.js --version
npm pack --dry-run
```

Use `--yes` for non-interactive automation and `--json` where supported. Test
filesystem changes in a temporary directory. Do not run the standalone stress
harness as a default test.

Keep README, `llms.txt`, and CLI help aligned when behavior changes. Run the
complete build and test suite before submitting a change.
