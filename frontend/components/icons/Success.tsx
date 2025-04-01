import React from "react";

export const Success = ({ className, ...props }: { className: string }) => {
  return (
    <svg
      className={`${className}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      display="none"
      {...props}
    >
      <g
        fill="none"
        stroke="hsl(138,90%,50%)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="11" strokeDasharray="69.12 69.12"></circle>
        <polyline
          points="7 12.5 10 15.5 17 8.5"
          strokeDasharray="14.2 14.2"
        ></polyline>
      </g>
    </svg>
  );
};
