import React from "react";

type ContainerTag = keyof React.JSX.IntrinsicElements;

type ContainerProps<T extends ContainerTag = "div"> = {
  as?: T;
  children: React.ReactNode;
  className?: string;
};

export function Container<T extends ContainerTag = "div">({
  as,
  children,
  className = "",
}: ContainerProps<T>) {
  const Tag = (as ?? "div") as ContainerTag;

  return (
    <Tag className={`mx-auto w-full max-w-7xl ${className}`.trim()}>
      {children}
    </Tag>
  );
}
