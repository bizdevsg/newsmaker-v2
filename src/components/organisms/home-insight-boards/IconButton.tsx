import React from "react";

type IconButtonProps = {
  label: string;
  iconClassName: string;
  onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  disabled?: boolean;
  className?: string;
};

export function IconButton({
  label,
  iconClassName,
  onClick,
  disabled = false,
  className = "",
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex h-6 w-6 items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-700 shadow-sm transition",
        "hover:bg-blue-50",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <i className={iconClassName} aria-hidden="true" />
    </button>
  );
}
