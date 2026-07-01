import { describe, it, expect } from "vitest";
import { generateExport } from "../../../src/lib/builder/exportGenerator";

describe("Export Integration Tests", () => {
  const completeSchema = {
    name: "EcommerceApp",
    description: "A full e-commerce app",
    screens: [
      {
        name: "Home",
        components: [
          { type: "searchBar", placeholder: "Search products..." },
          { type: "carousel", items: ["Sale", "New Arrivals", "Trending"] },
          { type: "categoryGrid", categories: ["Tech", "Fashion", "Home"] },
          { type: "productGrid", title: "Featured" },
          { type: "bottomNav" },
        ],
      },
      {
        name: "ProductDetail",
        components: [
          { type: "header", title: "Product", showBackButton: true },
          { type: "imageGallery", height: 300 },
          { type: "text", content: "Product Name", variant: "title" },
          { type: "text", content: "$99.99", variant: "price" },
          { type: "rating", value: 4.5 },
          { type: "button", text: "Add to Cart", variant: "primary" },
        ],
      },
      {
        name: "Cart",
        components: [
          { type: "header", title: "Cart" },
          { type: "cartList" },
          { type: "summary", items: ["Subtotal", "Shipping", "Total"] },
          { type: "button", text: "Checkout", variant: "primary" },
        ],
      },
    ],
    theme: {
      primaryColor: "#6366f1",
      secondaryColor: "#8b5cf6",
      backgroundColor: "#fafafa",
      cardStyle: "rounded-xl",
    },
    features: ["cart", "search", "wishlist"],
  };

  it("generates valid PWA for complex schema", () => {
    const files = generateExport(completeSchema, { format: "pwa" });
    expect(files.length).toBeGreaterThan(0);

    const html = files.find((f) => f.path === "index.html");
    expect(html).toBeDefined();
    expect(html!.content).toContain("EcommerceApp");
  });

  it("generates valid static export for complex schema", () => {
    const files = generateExport(completeSchema, { format: "static" });
    expect(files.length).toBeGreaterThan(0);

    const html = files.find((f) => f.path === "index.html");
    expect(html).toBeDefined();
  });

  it("generates valid Expo project for complex schema", () => {
    const files = generateExport(completeSchema, { format: "expo" });
    expect(files.length).toBeGreaterThan(0);

    const pkg = files.find((f) => f.path === "package.json");
    expect(pkg).toBeDefined();

    const parsedPkg = JSON.parse(pkg!.content);
    expect(parsedPkg.name).toBe("ecommerceapp");
  });

  it("all exports contain app name", () => {
    const formats = ["pwa", "static", "expo"] as const;
    for (const format of formats) {
      const files = generateExport(completeSchema, { format });
      const hasAppName = files.some((f) => f.content.includes("EcommerceApp"));
      expect(hasAppName, `Format ${format} should contain app name`).toBe(true);
    }
  });
});

describe("Schema Edge Cases", () => {
  it("handles schema with empty screens array", () => {
    const schema = {
      name: "EmptyApp",
      screens: [],
      theme: {},
      features: [],
    };

    expect(() => {
      generateExport(schema, { format: "pwa" });
    }).not.toThrow();
  });

  it("handles schema with minimal data", () => {
    const schema = {
      name: "Minimal",
    };

    expect(() => {
      generateExport(schema, { format: "pwa" });
    }).not.toThrow();
  });

  it("handles schema with missing theme", () => {
    const schema = {
      name: "NoTheme",
      screens: [{ name: "Home", components: [] }],
    };

    const files = generateExport(schema, { format: "pwa" });
    const html = files.find((f) => f.path === "index.html");
    expect(html).toBeDefined();
  });
});

describe("Export File Completeness", () => {
  const schema = {
    name: "TestApp",
    screens: [{ name: "Home", components: [{ type: "header", title: "Home" }] }],
    theme: { primaryColor: "#6366f1" },
    features: [],
  };

  it("PWA export has all essential files", () => {
    const files = generateExport(schema, { format: "pwa" });
    const paths = files.map((f) => f.path);
    expect(paths).toContain("index.html");
    expect(paths).toContain("manifest.json");
    expect(paths).toContain("sw.js");
  });

  it("Expo export has essential files", () => {
    const files = generateExport(schema, { format: "expo" });
    const paths = files.map((f) => f.path);
    expect(paths).toContain("package.json");
    expect(paths).toContain("App.tsx");
    expect(paths).toContain("app.json");
  });
});
