/**
 * Active content source. Reads the real content from the existing kardio.az
 * WordPress site via REST (headless). Set USE_MOCK_CONTENT=1 to fall back to
 * the local sample provider (offline dev). See PROJECT-PLAN.md §3.
 */
import type { ContentSource } from "./types";
import { wordpressContent } from "./wordpress";
import { mockContent } from "./mock";

export const content: ContentSource =
  process.env.USE_MOCK_CONTENT === "1" ? mockContent : wordpressContent;

export * from "./types";
