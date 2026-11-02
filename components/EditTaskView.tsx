"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";
import { getErrorMessage } from "@/utils/errors";
import { TaskForm } from "./TaskForm";
import { Alert } from "./ui/Alert";
import { LinkButton } from "./ui/LinkButton";
import { Spinner } from "./ui/Spinner";

export function EditTaskView({ id }: { id: string }) {
  const trpc = useTRPC();
  const {
    data: task,
    status,
    error,
  } = useQuery({ ...trpc.task.byId.queryOptions({ id }), retry: false });

  if (status === "pending") {
    return (
      <div role="status" className="flex items-center gap-2 text-sm text-muted">
        <Spinner />
        Loading task…
      </div>
    );
  }

  if (status === "error") {
    return (
      <Alert
        action={
          <LinkButton href="/" variant="secondary" size="sm">
            Back to tasks
          </LinkButton>
        }
      >
        {getErrorMessage(error)}
      </Alert>
    );
  }

  return <TaskForm task={task} />;
}
