import React from "react";

export const Upload = ({ className, ...props }: { className: string }) => {
  return (
    <svg
      className={` ${className}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    >
      <g
        fill="none"
        stroke="hsl(223,90%,50%)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle
          className="modal__icon-sdo69"
          cx="12"
          cy="12"
          r="11"
          strokeDasharray="69.12 69.12"
        ></circle>
        <polyline
          className="modal__icon-sdo14"
          points="7 12 12 7 17 12"
          strokeDasharray="14.2 14.2"
        ></polyline>
        <line
          className="modal__icon-sdo10"
          x1="12"
          y1="7"
          x2="12"
          y2="17"
          strokeDasharray="10 10"
        ></line>
      </g>
    </svg>
  );
};
