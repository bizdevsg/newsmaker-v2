import React from "react";

type IconBubbleVariant = "outline" | "soft";
type IconBubbleSize = "sm" | "md";

type IconBubbleProps = {
  iconClass: string;
  variant?: IconBubbleVariant;
  size?: IconBubbleSize;
  className?: string;
};

const sizes: Record<IconBubbleSize, string> = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
};

const variants: Record<IconBubbleVariant, string> = {
  outline: "border border-slate-200 text-blue-700",
  soft: "bg-blue-100 text-blue-700",
};

export function IconBubble({
  iconClass,
  variant = "soft",
  size = "sm",
  className = "",
}: IconBubbleProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-full ${sizes[size]} ${variants[variant]} ${className}`.trim()}
    >
      <i className={iconClass} aria-hidden="true"></i>
    </div>
  );
}
