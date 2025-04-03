import React from "react";

export const ErrorIcon = ({ className, ...props }: { className?: string }) => {
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
        stroke="hsl(3,90%,50%)"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle
          className="modal__icon-sdo69"
          cx="12"
          cy="12"
          r="11"
          strokeDasharray="69.12 69.12"
        ></circle>
        <line
          className="modal__icon-sdo14"
          x1="7"
          y1="7"
          x2="17"
          y2="17"
          strokeDasharray="14.2 14.2"
        ></line>
        <line
          className="modal__icon-sdo14"
          x1="17"
          y1="7"
          x2="7"
          y2="17"
          strokeDasharray="14.2 14.2"
        ></line>
      </g>
    </svg>
  );
};
