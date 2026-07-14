import { spawnSync } from "child_process";

const minimumLines = 65;
const result = spawnSync("bun", ["test", "--coverage", "--coverage-reporter=text"], {
  encoding: "utf8",
});
const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
process.stdout.write(output);

if (result.status !== 0) process.exit(result.status ?? 1);

const match = output.match(/^All files\s+\|\s+[^|]+\s+\|\s+([\d.]+)\s+\|/m);
const lines = match ? Number(match[1]) : Number.NaN;
if (!Number.isFinite(lines)) {
  console.error("Coverage check failed: aggregate line coverage was not reported.");
  process.exit(1);
}
if (lines < minimumLines) {
  console.error(`Coverage check failed: ${lines.toFixed(2)}% lines is below ${minimumLines}%.`);
  process.exit(1);
}
console.log(`Coverage check passed: ${lines.toFixed(2)}% lines (minimum ${minimumLines}%).`);
