import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { renderAppSchema } from "../../../src/lib/builder/appRenderer";

describe("App Renderer", () => {
  it("renders the active screen when activeScreenId is valid", () => {
    const schema = {
      activeScreenId: "profile",
      screens: [
        {
          id: "home",
          name: "Home",
          components: [{ type: "text", content: "Home screen", variant: "title" }],
        },
        {
          id: "profile",
          name: "Profile",
          components: [{ type: "text", content: "Profile screen", variant: "title" }],
        },
      ],
      imageAssets: [],
    };

    const html = renderToStaticMarkup(<>{renderAppSchema(schema)}</>);
    expect(html).toContain("Profile screen");
    expect(html).not.toContain("Home screen");
  });

  it("falls back to the first screen when activeScreenId is invalid", () => {
    const schema = {
      activeScreenId: "missing",
      screens: [
        {
          id: "home",
          name: "Home",
          components: [{ type: "text", content: "Home fallback", variant: "title" }],
        },
        {
          id: "profile",
          name: "Profile",
          components: [{ type: "text", content: "Profile screen", variant: "title" }],
        },
      ],
      imageAssets: [],
    };

    const html = renderToStaticMarkup(<>{renderAppSchema(schema)}</>);
    expect(html).toContain("Home fallback");
    expect(html).not.toContain("Profile screen");
  });

  it("renders uploaded image assets referenced by assetId", () => {
    const dataUrl = "data:image/png;base64,ZmFrZS1pbWFnZQ==";
    const schema = {
      activeScreenId: "home",
      screens: [
        {
          id: "home",
          name: "Home",
          components: [{ type: "image", assetId: "hero", alt: "Hero upload" }],
        },
      ],
      imageAssets: [{ id: "hero", name: "hero.png", dataUrl, mimeType: "image/png" }],
    };

    const html = renderToStaticMarkup(<>{renderAppSchema(schema)}</>);
    expect(html).toContain(`src="${dataUrl}"`);
    expect(html).toContain('alt="Hero upload"');
  });
});
