import { afterEach, describe, expect, it } from "bun:test";
import fs from "fs";
import os from "os";
import path from "path";
import {
  cleanOldBackups,
  createBackup,
  createBackups,
  deleteBackup,
  listBackups,
  restoreBackup,
} from "./backup.js";

const tempDirs: string[] = [];

function makeTempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "env-twin-backup-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

describe("backup utilities", () => {
  it("creates and lists backups without exposing values in metadata", () => {
    const cwd = makeTempDir();
    const envPath = path.join(cwd, ".env");
    fs.writeFileSync(envPath, "TOKEN=temporary-secret\n");

    expect(createBackup(envPath, cwd)).toBe(true);
    const backups = listBackups(cwd);
    expect(backups).toHaveLength(1);
    expect(backups[0].files).toEqual([".env"]);
    expect(backups[0].timestamp).toMatch(/^\d{8}-\d{6}$/);
    expect(JSON.stringify(backups)).not.toContain("temporary-secret");
  });

  it("skips missing and non-file inputs", () => {
    const cwd = makeTempDir();
    expect(createBackup(path.join(cwd, "missing.env"), cwd)).toBe(false);
    const directory = path.join(cwd, "directory.env");
    fs.mkdirSync(directory);
    expect(createBackup(directory, cwd)).toBe(false);
    expect(createBackups([path.join(cwd, "missing.env"), directory], cwd)).toBeNull();
  });

  it("restores a backup and handles missing backup directories", () => {
    const cwd = makeTempDir();
    const envPath = path.join(cwd, ".env");
    fs.writeFileSync(envPath, "KEY=original\n");
    expect(createBackup(envPath, cwd)).toBe(true);
    const timestamp = listBackups(cwd)[0].timestamp;

    fs.writeFileSync(envPath, "KEY=changed\n");
    expect(restoreBackup(timestamp, cwd)).toEqual({ restored: [".env"], failed: [] });
    expect(fs.readFileSync(envPath, "utf8")).toBe("KEY=original\n");
    expect(restoreBackup(timestamp, path.join(cwd, "other"))).toEqual({ restored: [], failed: [] });
  });

  it("deletes old backup sets while retaining the requested count", () => {
    const cwd = makeTempDir();
    const backupDir = path.join(cwd, ".env-twin");
    fs.mkdirSync(backupDir);
    for (const timestamp of ["20240101-010101", "20240102-010101", "20240103-010101"]) {
      fs.writeFileSync(path.join(backupDir, `.env.${timestamp}`), `KEY=${timestamp}\n`);
    }

    const result = cleanOldBackups(cwd, 1);
    expect(result.kept).toHaveLength(1);
    expect(result.deleted).toHaveLength(2);
    expect(listBackups(cwd)).toHaveLength(1);
    expect(deleteBackup("not-a-timestamp", cwd)).toBe(false);
  });
});
