# Contributing

Before opening a pull request, run:

```bash
bun install --frozen-lockfile
bun run build
bun test
npm pack --dry-run
```

Add focused tests for behavior changes. Use temporary directories for filesystem
tests and verify backups, permissions, and secret values remain safe. Keep
changes focused and never commit `.env`, `.env-twin/`, `dist/`, or credentials.

For issue labels and the Project 3 triage workflow, see
[docs/issue-management.md](docs/issue-management.md).
