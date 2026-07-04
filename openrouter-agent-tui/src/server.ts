import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { loadConfig } from "./config.js";
import { fetchModels, rawChatCompletion, type ChatMessage } from "./openrouter-http.js";
import { createOpenRouterClient, LOTUS_PRESET_SLUG, presetModels } from "./preset.js";
import { logger } from "./logger.js";
import { publicLimiter, apiLimiter } from "./rate-limit.js";
import { validateApiKey } from "./api-keys.js";
import { createSession, getSession, addMessage, getSessionHistory } from "./session-manager.js";

const PORT = Number(process.env.PORT || 8787);
const MAX_BODY_BYTES = 1024 * 1024;
const REQUIRE_API_KEY = process.env.REQUIRE_API_KEY === "true";

type JsonValue = Record<string, unknown> | unknown[];

interface RequestContext {
  ip: string;
  apiKey?: string;
  sessionId?: string;
  startTime: number;
}

function getClientIp(request: http.IncomingMessage): string {
  const forwarded = request.headers["x-forwarded-for"];
  if (forwarded) {
    return typeof forwarded === "string" ? forwarded.split(",")[0] : forwarded[0];
  }
  return request.socket?.remoteAddress || "unknown";
}

function getAuthToken(request: http.IncomingMessage): string | undefined {
  const auth = request.headers.authorization || "";
  if (auth.startsWith("Bearer ")) {
    return auth.slice(7);
  }
  return undefined;
}

async function sendHtml(response: http.ServerResponse, filePath: string): Promise<void> {
  const html = await fs.readFile(filePath, "utf8");
  response.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(html);
}

function sendJson(response: http.ServerResponse, statusCode: number, body: JsonValue): void {
  const payload = JSON.stringify(body);
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Session-ID",
    "Cache-Control": "no-store"
  });
  response.end(payload);
}

async function readJson(request: http.IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_BODY_BYTES) throw new Error("Request body is too large");
    chunks.push(buffer);
  }

  if (chunks.length === 0) return {};
  const raw = Buffer.concat(chunks).toString("utf8");
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Request body must be a JSON object");
  }
  return parsed as Record<string, unknown>;
}

function normalizeMessages(body: Record<string, unknown>): ChatMessage[] {
  if (typeof body.prompt === "string" && body.prompt.trim()) {
    return [{ role: "user", content: body.prompt.trim() }];
  }

  if (!Array.isArray(body.messages)) {
    throw new Error("Send either { prompt } or { messages }");
  }

  return body.messages.map((item) => {
    if (!item || typeof item !== "object") throw new Error("Each message must be an object");
    const message = item as Record<string, unknown>;
    const role = message.role;
    const content = message.content;
    if (!["system", "user", "assistant", "developer"].includes(String(role))) {
      throw new Error(`Invalid message role: ${String(role)}`);
    }
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("Message content must be a non-empty string");
    }
    return { role: role as ChatMessage["role"], content };
  });
}

async function route(request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {
  const ctx: RequestContext = {
    ip: getClientIp(request),
    apiKey: getAuthToken(request),
    startTime: Date.now()
  };

  try {
    if (request.method === "OPTIONS") {
      sendJson(response, 204, {});
      return;
    }

    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

    // Public routes (rate limited by IP)
    if (request.method === "GET" && url.pathname === "/") {
      if (!publicLimiter.isAllowed(ctx)) {
        const duration = Date.now() - ctx.startTime;
        logger.request("GET", "/", 429, duration, ctx.apiKey);
        return sendJson(response, 429, { error: "Rate limit exceeded", remaining: 0 });
      }
      await sendHtml(response, path.join(process.cwd(), "public", "index.html"));
      const duration = Date.now() - ctx.startTime;
      logger.request("GET", "/", 200, duration, ctx.apiKey);
      return;
    }

    if (request.method === "GET" && url.pathname === "/health") {
      const config = loadConfig();
      sendJson(response, 200, {
        ok: true,
        model: config.model,
        referer: config.referer,
        title: config.title,
        hasOpenRouterKey: Boolean(config.apiKey),
        timestamp: new Date().toISOString()
      });
      const duration = Date.now() - ctx.startTime;
      logger.request("GET", "/health", 200, duration, ctx.apiKey);
      return;
    }

    // API routes (require auth if enabled)
    if (REQUIRE_API_KEY && !ctx.apiKey) {
      const duration = Date.now() - ctx.startTime;
      logger.request(request.method || "GET", url.pathname, 401, duration, ctx.apiKey);
      return sendJson(response, 401, { error: "Authorization required. Use header: Authorization: Bearer <api_key>" });
    }

    if (ctx.apiKey) {
      const key = validateApiKey(ctx.apiKey);
      if (!key && REQUIRE_API_KEY) {
        const duration = Date.now() - ctx.startTime;
        logger.request(request.method || "GET", url.pathname, 403, duration, ctx.apiKey);
        return sendJson(response, 403, { error: "Invalid API key" });
      }
    }

    // Rate limit API calls
    if (!apiLimiter.isAllowed(ctx)) {
      const duration = Date.now() - ctx.startTime;
      logger.request(request.method || "GET", url.pathname, 429, duration, ctx.apiKey);
      return sendJson(response, 429, { error: "Rate limit exceeded", remaining: 0 });
    }

    if (request.method === "GET" && url.pathname === "/api/models") {
      const config = loadConfig();
      const models = await fetchModels(config);
      sendJson(response, 200, { count: models.length, models: models.slice(0, 100) });
      const duration = Date.now() - ctx.startTime;
      logger.request("GET", "/api/models", 200, duration, ctx.apiKey);
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/preset/lotus") {
      const config = loadConfig();
      const preset = await createOpenRouterClient(config).presets.get({ slug: LOTUS_PRESET_SLUG });
      const models = presetModels(preset);
      sendJson(response, 200, {
        slug: "@preset/lotus",
        validForChatCompletions: models.length <= 3,
        modelCount: models.length,
        models
      });
      const duration = Date.now() - ctx.startTime;
      logger.request("GET", "/api/preset/lotus", 200, duration, ctx.apiKey);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/chat") {
      const config = loadConfig();
      const body = await readJson(request);
      const sessionId = (typeof body.sessionId === "string" ? body.sessionId : undefined) || url.searchParams?.get("session");
      const stream = body.stream === true || url.searchParams?.get("stream") === "true";

      let messages = normalizeMessages(body);
      let session = sessionId ? getSession(sessionId) : null;

      // Load session history if provided
      if (sessionId && session) {
        ctx.sessionId = sessionId;
        const history = getSessionHistory(sessionId);
        if (history && history.length > 0) {
          messages = [...history, ...messages];
        }
      } else if (sessionId && !session) {
        return sendJson(response, 404, { error: "Session not found" });
      }

      const model = typeof body.model === "string" && body.model.trim() ? body.model.trim() : config.model;

      const promptLen = messages.reduce((sum, m) => sum + m.content.length, 0);
      const startChat = Date.now();
      const completion = await rawChatCompletion(config, messages, model);
      const chatDuration = Date.now() - startChat;

      const message = completion.choices?.[0]?.message;
      const responseLen = message?.content?.length || 0;

      logger.chat(model, promptLen, responseLen, chatDuration, ctx.apiKey);

      // Save to session if provided
      if (sessionId && session && message && message.role && message.content) {
        const userMsg = messages[messages.length - 1];
        addMessage(sessionId, userMsg);
        addMessage(sessionId, {
          role: message.role as ChatMessage["role"],
          content: message.content
        });
      }

      sendJson(response, 200, {
        ok: true,
        sessionId: sessionId || createSession(model, ctx.apiKey),
        model,
        message,
        usage: completion.usage || null
      });

      const duration = Date.now() - ctx.startTime;
      logger.request("POST", "/api/chat", 200, duration, ctx.apiKey);
      return;
    }

    // Sessions endpoint
    if (request.method === "POST" && url.pathname === "/api/sessions") {
      const body = await readJson(request);
      const model = typeof body.model === "string" ? body.model : "default";
      const sessionId = createSession(model, ctx.apiKey);
      sendJson(response, 201, { sessionId, model, createdAt: new Date().toISOString() });
      const duration = Date.now() - ctx.startTime;
      logger.request("POST", "/api/sessions", 201, duration, ctx.apiKey);
      return;
    }

    sendJson(response, 404, { error: "Not found" });
    const duration = Date.now() - ctx.startTime;
    logger.request(request.method || "GET", url.pathname, 404, duration, ctx.apiKey);
  } catch (error) {
    const duration = Date.now() - ctx.startTime;
    const message = error instanceof Error ? error.message : String(error);
    logger.error(request.url || "/", request.method || "GET", error as Error, ctx.apiKey);
    sendJson(response, 500, {
      error: message,
      status: 500
    });
    logger.request(request.method || "GET", request.url || "/", 500, duration, ctx.apiKey);
  }
}

const server = http.createServer((request, response) => {
  route(request, response).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Unhandled error:", message);
  });
});

async function startup(): Promise<void> {
  await logger.init();
  server.listen(PORT, () => {
    process.stdout.write(`Lotus OpenRouter Agent API listening on port ${PORT}\n`);
    process.stdout.write(`Environment: ${REQUIRE_API_KEY ? "Protected (API key required)" : "Public"}\n`);
  });
}

startup().catch(console.error);
