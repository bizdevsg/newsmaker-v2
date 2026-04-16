import React from "react";

type IconButtonProps = {
  label: string;
  iconClassName: string;
};

export function IconButton({ label, iconClassName }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-700 shadow-sm transition hover:bg-blue-50"
    >
      <i className={iconClassName} aria-hidden="true" />
    </button>
  );
}
