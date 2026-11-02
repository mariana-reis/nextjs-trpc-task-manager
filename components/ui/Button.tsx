import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/utils/cx";
import { Spinner } from "./Spinner";
import { buttonStyles, type ButtonSize, type ButtonVariant } from "./styles";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function Button({
  variant,
  size,
  loading = false,
  disabled,
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(buttonStyles({ variant, size }), className)}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
