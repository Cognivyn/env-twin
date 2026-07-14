import { describe, expect, it } from "bun:test";
import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";

const entrypoint = path.join(import.meta.dir, "index.ts");

function runCli(args: string[], cwd: string) {
  return spawnSync("bun", [entrypoint, ...args], { cwd, encoding: "utf8" });
}

describe("CLI dispatch", () => {
  it("rejects unknown commands without exposing environment values", () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "env-twin-cli-"));
    try {
      const result = runCli(["unknown-command"], cwd);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("Unknown command");
      expect(result.stderr).not.toContain("SECRET");
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("rejects malformed options before dispatch", () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "env-twin-cli-"));
    try {
      const result = runCli(["clean-backups", "--keep", "many"], cwd);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("must be a non-negative integer");
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("returns machine-readable compare output", () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "env-twin-cli-"));
    try {
      fs.writeFileSync(path.join(cwd, ".env"), "PUBLIC_KEY=redacted-test-value\n");
      const result = runCli(["compare", "--json"], cwd);
      expect(result.status).toBe(0);
      const report = JSON.parse(result.stdout);
      expect(report).toHaveProperty("files");
      expect(result.stdout).not.toContain("redacted-test-value");
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });
});
