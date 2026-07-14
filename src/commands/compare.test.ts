import fs from "fs";
import os from "os";
import path from "path";
import { createCompareReport } from "./compare.js";
import { EnvFileAnalysis } from "../modules/sync-logic.js";

describe("compare report", () => {
  let cwd: string;

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), "env-twin-compare-"));
  });

  afterEach(() => fs.rmSync(cwd, { recursive: true, force: true }));

  it("returns deterministic, redacted drift data", () => {
    fs.writeFileSync(path.join(cwd, ".env"), "API_KEY=super-secret\nSHARED=yes\n");
    fs.writeFileSync(path.join(cwd, ".env.example"), "SHARED=input_shared\n");

    const report = createCompareReport(new EnvFileAnalysis(cwd).analyze());

    expect(report).toEqual({
      schemaVersion: 1,
      status: "drift",
      sourceOfTruth: ".env.example",
      files: [".env", ".env.example"],
      missingKeys: {},
      orphanKeys: { ".env": ["API_KEY"] },
      summary: { files: 2, keys: 2, missing: 0, orphans: 1 },
    });
    expect(JSON.stringify(report)).not.toContain("super-secret");
  });

  it("reports a clean union when every file has the same keys", () => {
    fs.writeFileSync(path.join(cwd, ".env"), "A=one\nB=two\n");
    fs.writeFileSync(path.join(cwd, ".env.local"), "A=three\nB=four\n");

    const report = createCompareReport(new EnvFileAnalysis(cwd).analyze());
    expect(report.status).toBe("clean");
    expect(report.summary).toEqual({ files: 2, keys: 2, missing: 0, orphans: 0 });
  });
});
