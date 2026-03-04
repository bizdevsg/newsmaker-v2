import React from "react";

type ButtonVariant =
  | "primary"
  | "outline"
  | "ghost"
  | "primaryAlt"
  | "secondaryAlt";
type ButtonSize = "sm" | "md";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

const base =
  "inline-flex items-center justify-center gap-2 font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-5 text-sm",
};

const variants: Record<ButtonVariant, string> = {
  primary: "rounded-full bg-blue-600 text-white hover:bg-blue-700",
  outline:
    "rounded-full border border-slate-200 text-blue-700 hover:bg-slate-100 hover:text-slate-800",
  ghost: "rounded-full text-blue-700 hover:bg-slate-100",
  primaryAlt: "rounded bg-blue-800 text-blue-700 hover:bg-blue-700",
  secondaryAlt: "rounded bg-blue-200 text-gray-800 hover:bg-blue-300",
};

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
}: ButtonProps) {
  const classes = `${base} ${sizes[size]} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
