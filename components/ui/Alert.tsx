import type { ReactNode } from "react";

type AlertProps = { children: ReactNode; action?: ReactNode };

export function Alert({ children, action }: AlertProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-xl border border-danger-border bg-danger-soft p-4 text-sm text-danger sm:flex-row sm:items-center sm:justify-between"
    >
      <p>{children}</p>
      {action}
    </div>
  );
}
