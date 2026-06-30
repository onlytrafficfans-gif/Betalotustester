import { describe, it, expect } from "vitest";
import {
  validateAppSchema,
  defaultAppSchema,
  createEmptySchema,
  mergeSchemaUpdates,
} from "../../../src/lib/builder/appSchema";

describe("App Schema Validation", () => {
  it("validates a correct schema", () => {
    const result = validateAppSchema(defaultAppSchema);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("catches missing required fields", () => {
    const schema = {} as any;
    const result = validateAppSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("catches empty screen name", () => {
    const schema = {
      ...defaultAppSchema,
      screens: [{ name: "", components: [] }],
    };
    const result = validateAppSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("screen"))).toBe(true);
  });

  it("catches invalid component type", () => {
    const schema = {
      ...defaultAppSchema,
      screens: [
        {
          name: "Home",
          components: [{ type: "invalidType" }],
        },
      ],
    };
    const result = validateAppSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("component"))).toBe(true);
  });

  it("allows empty components array", () => {
    const schema = {
      ...defaultAppSchema,
      screens: [{ name: "Home", components: [] }],
    };
    const result = validateAppSchema(schema);
    expect(result.valid).toBe(true);
  });
});

describe("Empty Schema Creation", () => {
  it("creates schema with given name", () => {
    const schema = createEmptySchema("TestApp");
    expect(schema.name).toBe("TestApp");
    expect(schema.screens).toHaveLength(1);
    expect(schema.screens[0].name).toBe("Home");
  });

  it("creates schema with default Home screen", () => {
    const schema = createEmptySchema("MyApp");
    expect(schema.screens[0].components).toBeDefined();
    expect(schema.screens[0].components.length).toBeGreaterThan(0);
  });

  it("includes default theme", () => {
    const schema = createEmptySchema("App");
    expect(schema.theme).toBeDefined();
    expect(schema.theme.primaryColor).toBeDefined();
  });
});

describe("Schema Merge", () => {
  it("merges new screens", () => {
    const base = createEmptySchema("App");
    const updates = {
      screens: [
        ...base.screens,
        { name: "Settings", components: [{ type: "text", content: "Settings" }] },
      ],
    };
    const merged = mergeSchemaUpdates(base, updates);
    expect(merged.screens).toHaveLength(2);
    expect(merged.screens[1].name).toBe("Settings");
  });

  it("preserves existing screens not in updates", () => {
    const base = createEmptySchema("App");
    base.screens.push({
      name: "Profile",
      components: [{ type: "text", content: "Profile" }],
    });
    const updates = { theme: { primaryColor: "#ff0000" } };
    const merged = mergeSchemaUpdates(base, updates);
    expect(merged.screens).toHaveLength(2);
    expect(merged.theme.primaryColor).toBe("#ff0000");
  });

  it("deep merges theme", () => {
    const base = createEmptySchema("App");
    const updates = {
      theme: {
        primaryColor: "#ff0000",
      },
    };
    const merged = mergeSchemaUpdates(base, updates);
    expect(merged.theme.primaryColor).toBe("#ff0000");
    expect(merged.theme.backgroundColor).toBe(base.theme.backgroundColor);
  });
});

describe("Default Schema Structure", () => {
  it("has valid name", () => {
    expect(defaultAppSchema.name).toBeTruthy();
  });

  it("has at least one screen", () => {
    expect(defaultAppSchema.screens.length).toBeGreaterThan(0);
  });

  it("has valid theme", () => {
    expect(defaultAppSchema.theme.primaryColor).toMatch(/^#/);
    expect(defaultAppSchema.theme.backgroundColor).toMatch(/^#/);
  });

  it("has features array", () => {
    expect(Array.isArray(defaultAppSchema.features)).toBe(true);
  });
});
