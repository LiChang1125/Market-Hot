import { z } from "zod";
import type { AgentAbility } from "@aihot/backend/modules";

interface PublicReading {
  text: string;
  structured: Record<string, unknown>;
}

export function marketingAbility(
  path: string, title: string, ask: string, tool: string, read: () => Promise<PublicReading>,
): AgentAbility {
  return {
    path: "/" + path, title, ask, etagPrefix: path, cacheControl: "public, max-age=300",
    answer: async () => (await read()).text,
    mcp: { tool, use: ask, description: ask, input: z.object({}), run: read },
  };
}
