import React from "react";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
};

export function Card({
  children,
  className = "",
  as: Component = "div",
}: CardProps) {
  return (
    <Component
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`.trim()}
    >
      {children}
    </Component>
  );
}
