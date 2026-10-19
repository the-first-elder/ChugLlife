import { ReactElement, MouseEventHandler } from "react";

export default function Button({
  children,
  onClick,
  type,
  color = "primary",
  className,
  disabled,
  size = "md",
  id,
  testId,
}: {
  children: ReactElement | string;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  type: "submit" | "button";
  color?: "primary" | "secondary";
  className?: string | undefined;
  disabled?: boolean;
  size?: "sm" | "md";
  id?: string;
  testId?: string;
}): ReactElement {
  const buttonColor =
    disabled
      ? "bg-chog-ink/20 text-chog-ink/60"
      : color === "secondary"
        ? "bg-white text-chog-ink border border-chog-ink/15 hover:bg-chog-cream"
        : "bg-chog-pink text-white hover:bg-chog-pink-deep";

  const buttonSize = size === "sm" ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2.5";

  return (
    <button
      id={id}
      disabled={disabled}
      type={type}
      data-testid={testId}
      className={`${buttonColor} ${buttonSize} rounded-full inline-flex items-center font-bold text-white transition shadow-chog-sm ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
