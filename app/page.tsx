import { TaskList } from "@/components/TaskList";
import { getQueryClient, HydrateClient, trpc } from "@/lib/trpc/server";
import { PAGE_SIZE } from "@/utils/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Server-Side Rendering (SSR) prefetch: invoke the procedure via trpc options proxy directly in-process.
  // We pass identical query parameters and getNextPageParam as the client-side TaskList,
  // ensuring the dehydrated query cache seamlessly hydrates without duplicate client fetches.
  await getQueryClient()
    .infiniteQuery(
      trpc.task.list.infiniteQueryOptions(
        { limit: PAGE_SIZE },
        { getNextPageParam: (lastPage) => lastPage.nextCursor },
      ),
    )
    .catch(() => undefined);

  return (
    <HydrateClient>
      <TaskList />
    </HydrateClient>
  );
}
