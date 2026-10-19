import { ReactElement } from "react";

/** Shimmering placeholder block — pair with .cl-skeleton from index.css. */
export default function Skeleton({
  className = "",
  rounded = "rounded-2xl",
}: {
  className?: string;
  rounded?: string;
}): ReactElement {
  return (
    <div
      aria-hidden
      className={`cl-skeleton ${rounded} ${className}`}
    />
  );
}
