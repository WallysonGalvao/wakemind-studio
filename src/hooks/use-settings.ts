import * as React from "react";

// Settings is now an empty object — API key management moved to Supabase
export type Settings = Record<string, never>;

export function useSettings() {
  const [settings] = React.useState<Settings>({});
  return { settings };
}
