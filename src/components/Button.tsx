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
  const callerOwnsBackground = (className ?? "").includes("bg-");

  const buttonColor = disabled
    ? "bg-white/5 text-[#f4f1fe]/45 border border-white/10 cursor-not-allowed"
    : color === "secondary"
      ? "cl-btn-ghost"
      : callerOwnsBackground
        ? "bg-[#836ef9] hover:bg-[#9d8dfc] text-white shadow-chog-sm"
        : "cl-btn-primary";

  const buttonSize = size === "sm" ? "cl-btn-sm" : "cl-btn-md";

  return (
    <button
      id={id}
      disabled={disabled}
      type={type}
      data-testid={testId}
      className={`cl-btn ${buttonColor} ${buttonSize} ${className ?? ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
