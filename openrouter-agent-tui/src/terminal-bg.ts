export const colors = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m"
};

export function banner(model: string): void {
  process.stdout.write(`${colors.cyan}${colors.bold}OpenRouter Agent TUI${colors.reset}\n`);
  process.stdout.write(`${colors.gray}model ${model} | /help for commands | /exit to quit${colors.reset}\n\n`);
}

export function line(label: string, value: string): string {
  return `${colors.gray}${label}${colors.reset} ${value}`;
}
