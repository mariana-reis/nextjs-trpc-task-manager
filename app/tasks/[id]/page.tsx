import { EditTaskView } from "@/components/EditTaskView";
import { PageHeader } from "@/components/ui/PageHeader";
import { getQueryClient, HydrateClient, trpc } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  await getQueryClient()
    .query(trpc.task.byId.queryOptions({ id }))
    .catch(() => undefined);

  return (
    <HydrateClient>
      <PageHeader
        title="Edit task"
        description="Update the details of this task."
        backHref="/"
      />
      <EditTaskView id={id} />
    </HydrateClient>
  );
}
