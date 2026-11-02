import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "./Icons";

type PageHeaderProps = {
  title: string;
  description?: string;
  backHref?: string;
  action?: ReactNode;
};

export function PageHeader({ title, description, backHref, action }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {backHref && (
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-1 rounded text-sm text-muted transition-colors hover:text-foreground motion-reduce:transition-none"
        >
          <ArrowLeftIcon />
          Back to tasks
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
