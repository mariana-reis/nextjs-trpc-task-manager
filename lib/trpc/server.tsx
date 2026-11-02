import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache, type ReactNode } from "react";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { makeQueryClient } from "./query-client";

// Using React's cache() ensures QueryClient is instantiated once per incoming request on the server,
// preventing cross-request data leaks while enabling shared query state.
export const getQueryClient = cache(makeQueryClient);

// createTRPCOptionsProxy allows Server Components to invoke tRPC procedures directly in-process
// with zero internal HTTP overhead, generating pre-fetched data for seamless client hydration.
export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

export function HydrateClient({ children }: { children: ReactNode }) {
  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      {children}
    </HydrationBoundary>
  );
}
