import Link from "next/link";
import type { ComponentProps } from "react";
import { cx } from "@/utils/cx";
import { buttonStyles, type ButtonSize, type ButtonVariant } from "./styles";

type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function LinkButton({ variant, size, className, ...rest }: LinkButtonProps) {
  return <Link className={cx(buttonStyles({ variant, size }), className)} {...rest} />;
}
