"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useOnIntersect } from "@/hooks/useOnIntersect";
import { useDeleteTask } from "@/hooks/useTaskMutations";
import { useTRPC } from "@/lib/trpc/client";
import type { Task } from "@/types/task";
import { PAGE_SIZE } from "@/utils/constants";
import { getErrorMessage } from "@/utils/errors";
import { TaskCard } from "./TaskCard";
import { TaskListSkeleton } from "./TaskListSkeleton";
import { Alert } from "./ui/Alert";
import { Button } from "./ui/Button";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { EmptyState } from "./ui/EmptyState";
import { PlusIcon } from "./ui/Icons";
import { LinkButton } from "./ui/LinkButton";
import { PageHeader } from "./ui/PageHeader";
import { Spinner } from "./ui/Spinner";

export function TaskList() {
  const trpc = useTRPC();
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const deleteTask = useDeleteTask();

  const {
    data,
    status,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    trpc.task.list.infiniteQueryOptions(
      { limit: PAGE_SIZE },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  const loadMore = useCallback(() => void fetchNextPage(), [fetchNextPage]);
  const sentinelRef = useOnIntersect<HTMLDivElement>(
    loadMore,
    hasNextPage && !isFetchingNextPage,
  );

  function confirmDelete() {
    if (!taskToDelete) return;
    deleteTask.mutate({ id: taskToDelete.id });
    setTaskToDelete(null);
  }

  const tasks = data?.pages.flatMap((page) => page.items) ?? [];

  function renderBody() {
    if (status === "pending") return <TaskListSkeleton />;

    if (status === "error") {
      return (
        <Alert
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void refetch()}
            >
              Try again
            </Button>
          }
        >
          {getErrorMessage(error)}
        </Alert>
      );
    }

    if (tasks.length === 0) return <EmptyState />;

    return (
      <>
        <ul
          aria-label="Tasks"
          aria-busy={isFetchingNextPage}
          className="space-y-3"
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isDeleting={
                deleteTask.isPending && deleteTask.variables?.id === task.id
              }
              onDelete={setTaskToDelete}
            />
          ))}
        </ul>
        {hasNextPage && (
          <div
            ref={sentinelRef}
            className="flex min-h-16 w-full items-center justify-center py-6"
            aria-live="polite"
          >
            {isFetchingNextPage ? (
              <div
                role="status"
                className="flex items-center gap-2 text-sm text-muted"
              >
                <Spinner />
                <span>Loading more tasks…</span>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={loadMore}
                className="opacity-70 hover:opacity-100"
              >
                Load more
              </Button>
            )}
          </div>
        )}

        {!hasNextPage && (
          <p className="mt-6 text-center text-sm text-muted">No more tasks.</p>
        )}
      </>
    );
  }

  return (
    <section>
      <PageHeader
        title="Tasks"
        description="Create, edit and delete your tasks."
        action={
          <LinkButton href="/tasks/new">
            <PlusIcon />
            New task
          </LinkButton>
        }
      />

      {renderBody()}

      <ConfirmDialog
        open={taskToDelete !== null}
        title="Delete task?"
        description={`"${taskToDelete?.title ?? ""}" will be permanently deleted. This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </section>
  );
}
