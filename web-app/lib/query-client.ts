import { QueryClient } from "@tanstack/react-query";

// Shared query keys — any page using the same key hits the same cache.
// Dashboard + Chapters page both use KEYS.chapters → only one network request.
export const KEYS = {
  me:        ["me"]                as const,
  chapters:  ["chapters"]          as const,
  progress:  ["progress-summary"]  as const,
  analytics: ["progress-analytics"] as const,
  chapter:   (id: string) => ["chapter", id] as const,
  quiz:      (id: string) => ["quiz",    id] as const,
} as const;

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime:            5 * 60 * 1000, // 5 min — data re-used across page navigations
        gcTime:               15 * 60 * 1000, // 15 min — keep in memory after unmount
        retry:                1,
        refetchOnWindowFocus: false,          // don't refetch when user alt-tabs back
      },
    },
  });
}
