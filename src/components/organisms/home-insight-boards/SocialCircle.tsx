import React from "react";

type SocialCircleProps = {
  label: string;
  iconClassName: string;
};

export function SocialCircle({ label, iconClassName }: SocialCircleProps) {
  return (
    <a
      href="#"
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-700 shadow-sm transition hover:bg-blue-50"
    >
      <i className={iconClassName} aria-hidden="true" />
    </a>
  );
}

