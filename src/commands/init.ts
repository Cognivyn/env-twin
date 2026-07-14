import fs from "fs";
import path from "path";
import { createBackups } from "../utils/backup.js";
import { parseEnvLine } from "../modules/sync-logic.js";

export interface InitOptions {
  source?: string;
  destination?: string;
  yes?: boolean;
  force?: boolean;
  dryRun?: boolean;
  json?: boolean;
}

export function buildExampleContent(content: string): string {
  return content.split("\n").map((line) => {
    const parsed = parseEnvLine(line);
    if (!parsed.key) return line;
    const prefix = line.slice(0, line.indexOf(parsed.key));
    const placeholder = `input_${parsed.key.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
    return `${prefix}${parsed.key}="${placeholder}"`;
  }).join("\n");
}

export function runInit(options: InitOptions = {}): void {
  const cwd = process.cwd();
  const source = path.resolve(cwd, options.source || ".env");
  const destination = path.resolve(cwd, options.destination || ".env.example");
  if (!fs.existsSync(source)) throw new Error(`Source file '${source}' not found`);

  const sourceContent = fs.readFileSync(source, "utf8");
  const nextContent = buildExampleContent(sourceContent);
  const exists = fs.existsSync(destination);
  const changed = !exists || fs.readFileSync(destination, "utf8") !== nextContent;
  const result = { schemaVersion: 1, source: path.basename(source), destination: path.basename(destination), exists, changed, dryRun: Boolean(options.dryRun) };

  if (options.json) console.log(JSON.stringify(result, null, 2));
  if (!changed || options.dryRun) return;
  if (exists && !options.force && !options.yes) {
    throw new Error(`'${path.basename(destination)}' already exists; use --force or --yes to replace it`);
  }
  if (exists) createBackups([destination], cwd);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, nextContent);
  if (!options.json) console.log(`Success: Generated '${path.basename(destination)}' from '${path.basename(source)}'`);
}
