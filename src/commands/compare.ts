import { EnvFileAnalysis, EnvAnalysisReport } from "../modules/sync-logic.js";

export interface CompareOptions {
  source?: string;
  json?: boolean;
  check?: boolean;
}

interface PublicCompareReport {
  schemaVersion: 1;
  status: "clean" | "drift";
  sourceOfTruth: string | null;
  files: string[];
  missingKeys: Record<string, string[]>;
  orphanKeys: Record<string, string[]>;
  summary: {
    files: number;
    keys: number;
    missing: number;
    orphans: number;
  };
}

export function createCompareReport(report: EnvAnalysisReport): PublicCompareReport {
  const sortRecord = (record: Record<string, string[]>) =>
    Object.fromEntries(
      Object.entries(record)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([file, keys]) => [file, [...keys].sort()]),
    );
  const missingKeys = sortRecord(report.missingKeys);
  const orphanKeys = sortRecord(report.orphanKeys);
  const missing = Object.values(missingKeys).reduce((count, keys) => count + keys.length, 0);
  const orphans = Object.values(orphanKeys).reduce((count, keys) => count + keys.length, 0);

  return {
    schemaVersion: 1,
    status: missing || orphans ? "drift" : "clean",
    sourceOfTruth: report.sourceOfTruth || null,
    files: report.files.map((file) => file.fileName).sort(),
    missingKeys,
    orphanKeys,
    summary: {
      files: report.files.length,
      keys: report.allKeys.size,
      missing,
      orphans,
    },
  };
}

export function runCompare(options: CompareOptions = {}): number {
  const report = createCompareReport(new EnvFileAnalysis(process.cwd()).analyze({ sourceOfTruth: options.source }));

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Compared ${report.summary.files} .env* file(s).`);
    console.log(`Source of truth: ${report.sourceOfTruth ?? "union of all files"}`);
    if (report.status === "clean") {
      console.log("No key drift detected.");
    } else {
      console.log(`Drift detected: ${report.summary.missing} missing, ${report.summary.orphans} orphan key(s).`);
      printEntries("Missing keys", report.missingKeys);
      printEntries("Orphan keys", report.orphanKeys);
    }
  }

  return options.check && report.status === "drift" ? 1 : 0;
}

function printEntries(title: string, entries: Record<string, string[]>): void {
  if (Object.keys(entries).length === 0) return;
  console.log(`${title}:`);
  for (const [file, keys] of Object.entries(entries)) {
    console.log(`  ${file}: ${keys.join(", ")}`);
  }
}
