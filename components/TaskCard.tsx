import type { Task } from "@/types/task";
import { cx } from "@/utils/cx";
import { formatCreatedAt } from "@/utils/format";
import { Button } from "./ui/Button";
import { PencilIcon, TrashIcon } from "./ui/Icons";
import { LinkButton } from "./ui/LinkButton";
import { cardStyles } from "./ui/styles";

type TaskCardProps = {
  task: Task;
  isDeleting: boolean;
  onDelete: (task: Task) => void;
};

export function TaskCard({ task, isDeleting, onDelete }: TaskCardProps) {
  return (
    <li
      className={cx(
        cardStyles,
        "flex flex-col gap-4 p-4 transition-all duration-150 hover:shadow-md sm:flex-row sm:items-start sm:justify-between",
        isDeleting && "opacity-60",
      )}
    >
      <div className="min-w-0 space-y-1">
        <h2 className="wrap-break-word text-base font-semibold">
          {task.title}
        </h2>
        {task.description && (
          <p className="line-clamp-3 whitespace-pre-line wrap-break-word text-sm text-muted">
            {task.description}
          </p>
        )}
        <p className="pt-1 text-xs text-muted">
          Created{" "}
          <time
            dateTime={new Date(task.createdAt).toISOString()}
            suppressHydrationWarning
          >
            {formatCreatedAt(task.createdAt)}
          </time>
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        <LinkButton
          href={`/tasks/${task.id}`}
          variant="secondary"
          size="sm"
          aria-label={`Edit task: ${task.title}`}
        >
          <PencilIcon />
          Edit
        </LinkButton>
        <Button
          variant="danger"
          size="sm"
          loading={isDeleting}
          aria-label={`Delete task: ${task.title}`}
          onClick={() => onDelete(task)}
        >
          {isDeleting ? (
            "Deleting…"
          ) : (
            <>
              <TrashIcon />
              Delete
            </>
          )}
        </Button>
      </div>
    </li>
  );
}
