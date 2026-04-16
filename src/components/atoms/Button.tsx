import React from "react";

type ButtonVariant =
  | "primary"
  | "outline"
  | "ghost"
  | "primaryAlt"
  | "secondaryAlt";
type ButtonSize = "sm" | "md";
type ButtonAs = "button" | "a" | "span";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  as?: ButtonAs;
};

const base =
  "inline-flex items-center justify-center gap-2 font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-5 text-sm",
};

const variants: Record<ButtonVariant, string> = {
  primary: "rounded-md bg-blue-600 text-white hover:bg-blue-700",
  outline:
    "rounded-md border border-slate-200 text-blue-700  group-hover:bg-slate-100  hover:bg-slate-100 group-hover:text-slate-800 hover:text-slate-800",
  ghost: "rounded-md text-blue-700 group-hover:bg-slate-100 hover:bg-slate-100",
  primaryAlt:
    "rounded bg-blue-800 text-blue-700 group-hover:bg-blue-700 hover:bg-blue-700",
  secondaryAlt:
    "rounded bg-blue-200 text-gray-800 group-hover:bg-blue-300 hover:bg-blue-300",
};

export function Button({
  children,
  href,
  target,
  rel,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  as,
}: ButtonProps) {
  const classes = `${base} ${sizes[size]} ${variants[variant]} ${className}`;

  if (as === "span") {
    return <span className={classes}>{children}</span>;
  }

  if (href && as !== "button") {
    return (
      <a href={href} target={target} rel={rel} className={classes}>
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
