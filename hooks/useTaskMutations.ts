import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/client";
import type { Task, TaskFields } from "@/types/task";
import { getErrorMessage } from "@/utils/errors";

export function useDeleteTask() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: () => toast.success("Task deleted"),
      onError: (error) => toast.error(getErrorMessage(error)),
      onSettled: () => queryClient.invalidateQueries(trpc.task.pathFilter()),
    }),
  );
}

export function useSaveTask(task?: Task) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const options = {
    onSuccess: async () => {
      toast.success(task ? "Task updated" : "Task created");
      await queryClient.invalidateQueries(trpc.task.pathFilter());
      router.push("/");
    },
    onError: (err: unknown) => {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
    },
  };

  const create = useMutation(trpc.task.create.mutationOptions(options));
  const update = useMutation(trpc.task.update.mutationOptions(options));

  function save(fields: TaskFields) {
    setError(null);
    if (task) update.mutate({ id: task.id, ...fields });
    else create.mutate(fields);
  }

  return { save, error, isPending: create.isPending || update.isPending };
}
