const frames = ["-", "\\", "|", "/"];

export class Loader {
  private timer: NodeJS.Timeout | undefined;
  private index = 0;

  start(label = "Working"): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      process.stdout.write(`\r${frames[this.index % frames.length]} ${label}`);
      this.index += 1;
    }, 90);
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = undefined;
    process.stdout.write("\r\x1b[2K");
  }
}
