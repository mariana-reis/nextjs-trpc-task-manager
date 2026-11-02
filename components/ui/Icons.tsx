import {
  ArrowLeft,
  ClipboardCheck,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  type LucideProps,
} from "lucide-react";
import { cx } from "@/utils/cx";

export type IconProps = LucideProps;

// Wrapped Lucide React icons for the Task Manager application.
// We apply 'aria-hidden="true"' by default (decorative icons) alongside
// the standard 'size-4' dimension from the application design system.

export function PlusIcon({ className, ...props }: IconProps) {
  return <Plus aria-hidden="true" className={cx("size-4", className)} {...props} />;
}

export function PencilIcon({ className, ...props }: IconProps) {
  return <Pencil aria-hidden="true" className={cx("size-4", className)} {...props} />;
}

export function TrashIcon({ className, ...props }: IconProps) {
  return <Trash2 aria-hidden="true" className={cx("size-4", className)} {...props} />;
}

export function ArrowLeftIcon({ className, ...props }: IconProps) {
  return <ArrowLeft aria-hidden="true" className={cx("size-4", className)} {...props} />;
}

export function ClipboardCheckIcon({ className, ...props }: IconProps) {
  return <ClipboardCheck aria-hidden="true" className={cx("size-4", className)} {...props} />;
}

export function SpinnerIcon({ className, ...props }: IconProps) {
  return <Loader2 aria-hidden="true" className={cx("size-4", className)} {...props} />;
}
