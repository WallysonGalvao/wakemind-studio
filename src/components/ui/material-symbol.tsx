import React from "react";
import { cn } from "@/lib/utils";

export type MaterialSymbolName = string;

export interface MaterialSymbolProps {
  name: MaterialSymbolName;
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Material Symbols Rounded (Filled) icon component for Web (Vite).
 * Uses the official Google Material Symbols font with FILL=1.
 */
export function MaterialSymbol({
  name,
  size = 24,
  color = "currentColor",
  className,
}: MaterialSymbolProps) {
  return (
    <span
      className={cn("material-symbols-rounded-filled", className)}
      style={{
        fontSize: size,
        color: color,
        fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
        display: "inline-block",
        lineHeight: 1,
        userSelect: "none",
        textAlign: "center",
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
