import Link from "next/link";
import { cx } from "@/utils/cx";
import { ClipboardCheckIcon } from "./ui/Icons";
import { containerStyles } from "./ui/styles";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur">
      <div className={cx(containerStyles, "flex h-16 items-center")}>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg text-base font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
            <ClipboardCheckIcon className="size-5" />
          </span>
          Task Manager
        </Link>
      </div>
    </header>
  );
}
