import crypto from "node:crypto";

interface ApiKeyRecord {
  key: string;
  name: string;
  created: string;
  lastUsed?: string;
  rateLimit: number; // req/min
}

// In-memory store (in production, use a database)
const keys: Map<string, ApiKeyRecord> = new Map();

// Initialize with default development key if not set
function initializeKeys(): void {
  const devKeyEnv = process.env.API_KEY_DEVELOPMENT;
  if (devKeyEnv) {
    keys.set(devKeyEnv, {
      key: devKeyEnv,
      name: "Development Key",
      created: new Date().toISOString(),
      rateLimit: 1000 // High limit for dev
    });
  }
}

export function validateApiKey(token: string): ApiKeyRecord | null {
  if (!token) return null;
  const record = keys.get(token);
  if (record) {
    record.lastUsed = new Date().toISOString();
  }
  return record || null;
}

export function generateApiKey(name: string, rateLimit: number = 60): string {
  const key = `lr_${crypto.randomBytes(24).toString("hex")}`;
  keys.set(key, {
    key,
    name,
    created: new Date().toISOString(),
    rateLimit
  });
  return key;
}

export function listApiKeys(): ApiKeyRecord[] {
  return Array.from(keys.values()).map((k) => ({
    ...k,
    key: k.key.slice(0, 10) + "..."
  }));
}

export function revokeApiKey(token: string): boolean {
  return keys.delete(token);
}

initializeKeys();
