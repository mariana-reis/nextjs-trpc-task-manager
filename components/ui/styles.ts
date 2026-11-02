export const containerStyles = "mx-auto w-full max-w-3xl px-4 sm:px-6";

export const cardStyles = "rounded-xl border border-border bg-surface shadow-sm";

export const inputStyles =
  "mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground " +
  "placeholder:text-muted aria-[invalid=true]:border-danger";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap " +
  "transition-colors motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50";

const buttonVariants = {
  primary: "bg-brand text-brand-foreground hover:bg-brand-hover",
  secondary: "border border-border bg-surface text-foreground hover:bg-background",
  danger: "border border-danger-border bg-surface text-danger hover:bg-danger-soft",
} as const;

const buttonSizes = {
  md: "h-10 px-4 text-sm",
  sm: "h-9 px-3 text-sm",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;

export function buttonStyles({
  variant = "primary",
  size = "md",
}: { variant?: ButtonVariant; size?: ButtonSize } = {}) {
  return `${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]}`;
}
