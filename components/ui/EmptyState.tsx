import { ClipboardCheckIcon, PlusIcon } from "./Icons";
import { LinkButton } from "./LinkButton";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
        <ClipboardCheckIcon className="size-6" />
      </span>
      <h2 className="mt-4 text-base font-semibold">No tasks yet</h2>
      <p className="mt-1 text-sm text-muted">Create your first task to get started.</p>
      <LinkButton href="/tasks/new" className="mt-6">
        <PlusIcon />
        New task
      </LinkButton>
    </div>
  );
}
