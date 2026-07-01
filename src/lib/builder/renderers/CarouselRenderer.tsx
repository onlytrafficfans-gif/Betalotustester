/**
 * CarouselRenderer
 *
 * Extracted from appRenderer.tsx for file-size compliance (<800 lines).
 * Renders an auto-advancing image/text carousel component.
 */

import { useState, useEffect } from "react";

interface CarouselRendererProps {
  items?: string[];
}

export function CarouselRenderer({ items }: CarouselRendererProps) {
  const [current, setCurrent] = useState(0);
  const itemList = items || ["Banner 1", "Banner 2", "Banner 3"];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % itemList.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [itemList.length]);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {itemList.map((item, i) => (
          <div
            key={i}
            className="w-full flex-shrink-0 h-36 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center"
          >
            <span className="text-lg font-semibold text-primary">{item}</span>
          </div>
        ))}
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {itemList.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === current ? "bg-primary w-4" : "bg-primary/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
