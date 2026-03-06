import React from "react";

type PillButtonProps = {
  active?: boolean;
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

const sizes = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-1.5 text-sm",
};

export function PillButton({
  active = false,
  size = "sm",
  children,
  className = "",
  onClick,
}: PillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full ${sizes[size]} ${
        active ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-500"
      } ${className}`.trim()}
    >
      {children}
    </button>
  );
}
