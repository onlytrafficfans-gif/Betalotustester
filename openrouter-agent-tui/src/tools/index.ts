import { serverTool } from "@openrouter/agent";
import { createFileEditTool } from "./file-edit.js";
import { createFileReadTool } from "./file-read.js";
import { createFileWriteTool } from "./file-write.js";
import { createGlobTool } from "./glob.js";
import { createGrepTool } from "./grep.js";
import { createListDirTool } from "./list-dir.js";
import { createShellTool } from "./shell.js";
import { createProjectBriefTool } from "./custom.js";

export function createTools(cwd: string) {
  return [
    serverTool({ type: "openrouter:web_search" } as never),
    serverTool({ type: "openrouter:datetime", parameters: { timezone: "America/Los_Angeles" } } as never),
    createFileReadTool(cwd),
    createFileWriteTool(cwd),
    createFileEditTool(cwd),
    createGlobTool(cwd),
    createGrepTool(cwd),
    createListDirTool(cwd),
    createShellTool(cwd),
    createProjectBriefTool(cwd)
  ] as const;
}
