/**
 * TabsRenderer
 *
 * Extracted from appRenderer.tsx for file-size compliance (<800 lines).
 * Renders an interactive tab bar with active state.
 */

import { useState } from "react";

interface TabsRendererProps {
  tabs?: string[];
}

export function TabsRenderer({ tabs }: TabsRendererProps) {
  const [active, setActive] = useState(0);
  const tabList = tabs || ["Tab 1", "Tab 2", "Tab 3"];

  return (
    <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
      {tabList.map((tab, i) => (
        <button
          key={i}
          onClick={() => setActive(i)}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
            active === i
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
