import React from "react";

type HighlightTabButtonProps = {
  label: string;
  active?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export function HighlightTabButton({
  label,
  active = false,
  onClick,
}: HighlightTabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
        active
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-700"
      }`}
    >
      {label}
    </button>
  );
}
