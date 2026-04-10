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
      className={`rounded-xl border border-blue-200 bg-white shadow-sm shadow-blue-300/50 ${className}`.trim()}
    >
      {children}
    </Component>
  );
}
