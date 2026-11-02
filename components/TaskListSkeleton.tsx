import { cardStyles } from "./ui/styles";
import { cx } from "@/utils/cx";

export function TaskListSkeleton() {
  return (
    <div role="status" aria-label="Loading tasks" className="space-y-3">
      {[0, 1, 2].map((key) => (
        <div
          key={key}
          className={cx(
            cardStyles,
            "animate-pulse space-y-3 p-4 motion-reduce:animate-none",
          )}
        >
          <div className="h-4 w-1/3 rounded bg-border" />
          <div className="h-3 w-2/3 rounded bg-border" />
          <div className="h-3 w-1/4 rounded bg-border" />
        </div>
      ))}
      <span className="sr-only">Loading tasks…</span>
    </div>
  );
}
