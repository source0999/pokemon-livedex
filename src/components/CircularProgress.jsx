import React from "react";

export default function CircularProgress({ percentage, size = 100, strokeWidth = 10, color = "#a855f7" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Ensure we don't go over 100 or under 0 for the math
  const cleanPercentage = Math.min(Math.max(percentage, 0), 100);
  const offset = circumference - (cleanPercentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90 block">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          style={{ 
            strokeDashoffset: offset, 
            transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)" 
          }}
          strokeLinecap="round"
        />
      </svg>
      {/* Centered Text with improved Font */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold leading-none text-white font-sans">
          {Math.round(cleanPercentage)}%
        </span>
      </div>
    </div>
  );
}