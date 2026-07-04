import fs from "node:fs/promises";
import path from "node:path";

export const MAX_TEXT_LINES = 2000;
export const MAX_LINE_LENGTH = 1000;
export const MAX_OUTPUT_CHARS = 256 * 1024;

export function resolveInsideCwd(cwd: string, target: string): string {
  const resolved = path.resolve(cwd, target);
  const root = path.resolve(cwd);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Path escapes workspace: ${target}`);
  }
  return resolved;
}

export function truncateText(text: string, maxChars = MAX_OUTPUT_CHARS): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n[truncated ${text.length - maxChars} chars]`;
}

export function limitLines(text: string, maxLines = MAX_TEXT_LINES): string {
  const lines = text.split(/\r?\n/);
  const capped = lines.slice(0, maxLines).map((line) => {
    if (line.length <= MAX_LINE_LENGTH) return line;
    return `${line.slice(0, MAX_LINE_LENGTH)} [line truncated]`;
  });
  if (lines.length > maxLines) capped.push(`[truncated ${lines.length - maxLines} lines]`);
  return capped.join("\n");
}

export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
