import { describe, it, expect } from "vitest";
import {
  generateExport,
  type ExportFormat,
} from "../../../src/lib/builder/exportGenerator";

describe("Export Generator", () => {
  const mockSchema = {
    name: "TestApp",
    description: "A test app",
    screens: [
      {
        name: "Home",
        components: [
          { type: "header", title: "Home" },
          { type: "text", content: "Welcome", variant: "title" },
          { type: "button", text: "Get Started", variant: "primary" },
        ],
      },
    ],
    theme: {
      primaryColor: "#6366f1",
      backgroundColor: "#ffffff",
    },
    features: [],
  };

  it("generates PWA export with all required files", () => {
    const files = generateExport(mockSchema, { format: "pwa" });
    const paths = files.map((f) => f.path);
    expect(paths).toContain("index.html");
    expect(paths).toContain("manifest.json");
    expect(paths).toContain("sw.js");
    expect(paths).toContain("icon.svg");
  });

  it("generates static export without service worker", () => {
    const files = generateExport(mockSchema, { format: "static" });
    const paths = files.map((f) => f.path);
    expect(paths).toContain("index.html");
    expect(paths).toContain("manifest.json");
    expect(paths).not.toContain("sw.js");
  });

  it("generates expo export with package.json", () => {
    const files = generateExport(mockSchema, { format: "expo" });
    const paths = files.map((f) => f.path);
    expect(paths).toContain("package.json");
    expect(paths).toContain("App.tsx");
    expect(paths).toContain("app.json");
  });

  it("index.html contains app name", () => {
    const files = generateExport(mockSchema, { format: "pwa" });
    const indexHtml = files.find((f) => f.path === "index.html");
    expect(indexHtml?.content).toContain("TestApp");
  });

  it("manifest.json has correct theme colors", () => {
    const files = generateExport(mockSchema, { format: "pwa" });
    const manifest = files.find((f) => f.path === "manifest.json");
    const parsed = JSON.parse(manifest!.content);
    expect(parsed.theme_color).toBe("#6366f1");
    expect(parsed.background_color).toBe("#ffffff");
    expect(parsed.icons[0].src).toBe("icon.svg");
  });

  it("throws error for unsupported format", () => {
    expect(() => {
      generateExport(mockSchema, { format: "invalid" as ExportFormat });
    }).toThrow();
  });
});

describe("PWA Export Content", () => {
  const schema = {
    name: "MyPWA",
    screens: [
      {
        name: "Home",
        components: [
          { type: "header", title: "MyPWA" },
          { type: "button", text: "Click Me" },
        ],
      },
    ],
    theme: { primaryColor: "#ff0000", backgroundColor: "#fafafa" },
    features: [],
  };

  it("service worker caches essential files", () => {
    const files = generateExport(schema, { format: "pwa" });
    const sw = files.find((f) => f.path === "sw.js");
    expect(sw?.content).toContain("index.html");
    expect(sw?.content).toContain("CACHE_NAME");
  });

  it("CSS includes theme colors", () => {
    const files = generateExport(schema, { format: "pwa" });
    const html = files.find((f) => f.path === "index.html");
    expect(html?.content).toContain("#ff0000");
    expect(html?.content).toContain("#fafafa");
  });

  it("does not reference missing PNG icons", () => {
    const files = generateExport(schema, { format: "pwa" });
    const html = files.find((f) => f.path === "index.html");
    const manifest = files.find((f) => f.path === "manifest.json");
    const sw = files.find((f) => f.path === "sw.js");
    expect(html?.content).not.toContain("icon-192.png");
    expect(manifest?.content).not.toContain("icon-512.png");
    expect(sw?.content).not.toContain("icon-192.png");
  });
});

describe("Export Schema Rendering", () => {
  it("uses activeScreenId for exported HTML", () => {
    const schema = {
      name: "ActiveExport",
      activeScreenId: "details",
      screens: [
        { id: "home", name: "Home", components: [{ type: "text", content: "Home export", variant: "title" }] },
        { id: "details", name: "Details", components: [{ type: "text", content: "Details export", variant: "title" }] },
      ],
      theme: {},
      imageAssets: [],
      features: [],
    };

    const files = generateExport(schema, { format: "pwa" });
    const html = files.find((f) => f.path === "index.html");
    expect(html?.content).toContain("Details export");
    expect(html?.content).not.toContain("Home export");
  });

  it("includes image asset data URLs in exported HTML", () => {
    const dataUrl = "data:image/png;base64,ZXhwb3J0ZWQtaW1hZ2U=";
    const schema = {
      name: "ImageExport",
      activeScreenId: "home",
      screens: [
        {
          id: "home",
          name: "Home",
          components: [{ type: "image", imageAssetId: "hero", alt: "Export hero" }],
        },
      ],
      theme: {},
      imageAssets: [{ id: "hero", name: "hero.png", dataUrl, mimeType: "image/png" }],
      features: [],
    };

    const files = generateExport(schema, { format: "static" });
    const html = files.find((f) => f.path === "index.html");
    expect(html?.content).toContain(dataUrl);
    expect(html?.content).toContain("Export hero");
  });
});

describe("Static Export Differences from PWA", () => {
  const schema = {
    name: "StaticApp",
    screens: [{ name: "Home", components: [] }],
    theme: { primaryColor: "#000" },
    features: [],
  };

  it("does not include service worker registration", () => {
    const files = generateExport(schema, { format: "static" });
    const html = files.find((f) => f.path === "index.html")!;
    expect(html.content).not.toContain("serviceWorker");
  });
});

describe("Expo Export Structure", () => {
  const schema = {
    name: "ExpoApp",
    screens: [
      { name: "Home", components: [{ type: "text", content: "Hello" }] },
      { name: "Profile", components: [] },
    ],
    theme: { primaryColor: "#6366f1" },
    features: [],
  };

  it("creates screen components for each screen", () => {
    const files = generateExport(schema, { format: "expo" });
    expect(files.some((f) => f.path === "src/screens/Home.tsx")).toBe(true);
    expect(files.some((f) => f.path === "src/screens/Profile.tsx")).toBe(true);
  });

  it("navigation imports all screens", () => {
    const files = generateExport(schema, { format: "expo" });
    const nav = files.find((f) => f.path === "src/navigation/AppNavigator.tsx");
    expect(nav?.content).toContain("Home");
    expect(nav?.content).toContain("Profile");
  });
});
