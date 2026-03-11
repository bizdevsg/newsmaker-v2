import React from "react";

type IconCircleProps = {
  iconClass: string;
  className?: string;
};

export function IconCircle({ iconClass, className = "" }: IconCircleProps) {
  return (
    <div
      className={`bg-blue-100 rounded-full w-10 h-10 text-sm text-blue-800 flex items-center justify-center ${className}`}
    >
      <i className={`text-xl ${iconClass}`} aria-hidden="true"></i>
    </div>
  );
}
