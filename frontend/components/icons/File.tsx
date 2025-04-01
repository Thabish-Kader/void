import React from "react";

export const File = ({ className, ...props }: { className: string }) => {
  return (
    <svg
      className={`${className}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="4 1 12 1 20 8 20 23 4 23"></polygon>
        <polyline points="12 1 12 8 20 8"></polyline>
      </g>
    </svg>
  );
};
