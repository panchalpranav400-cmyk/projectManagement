"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BoxesCore = ({
  className,
  rowsCount = 65,
  colsCount = 45,
  ...rest
}: {
  className?: string;
  rowsCount?: number;
  colsCount?: number;
  [key: string]: unknown;
}) => {
  const rows = new Array(rowsCount).fill(1);
  const cols = new Array(colsCount).fill(1);

  // Vibrant neon and pastel colors that pop against the dark background
  const colors = [
    "rgb(56 189 248)", // sky-400
    "rgb(244 114 182)", // pink-400
    "rgb(52 211 153)", // emerald-400
    "rgb(250 204 21)",  // yellow-400
    "rgb(248 113 113)", // red-400
    "rgb(192 132 252)", // purple-400
    "rgb(96 165 250)",  // blue-400
    "rgb(129 140 248)", // indigo-400
    "rgb(168 85 247)",  // violet-500
    "rgb(45 212 191)",  // teal-400
  ];

  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  function handleMouseEnter(e: React.MouseEvent<HTMLDivElement>) {
    const c = getRandomColor();
    const el = e.currentTarget;
    el.style.backgroundColor = c;
    el.style.boxShadow = `0 0 28px ${c}, inset 0 0 12px ${c}`;
    el.style.borderColor = c;
    el.style.zIndex = "2";
    el.style.transition = "all 0s";
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    el.style.backgroundColor = "transparent";
    el.style.boxShadow = "none";
    el.style.borderColor = "";
    el.style.zIndex = "0";
    el.style.transition = "all 1.6s cubic-bezier(0.16, 1, 0.3, 1)";
  }

  return (
    <div
      style={{
        transform: `translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)`,
      }}
      className={cn(
        "absolute left-1/4 p-4 -top-1/4 flex -translate-x-1/2 -translate-y-1/2 w-full h-full z-0 pointer-events-auto",
        className
      )}
      {...rest}
    >
      {rows.map((_, i) => (
        <div
          key={`row` + i}
          className="w-16 h-8 border-l border-slate-700/50 relative"
        >
          {cols.map((_, j) => {
            return (
              <motion.div
                key={`col` + j}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="w-16 h-8 border-r border-t border-slate-700/50 relative cursor-pointer pointer-events-auto"
              >
                {j % 2 === 0 && i % 2 === 0 ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="absolute h-6 w-10 -top-[14px] -left-[22px] text-slate-700/80 stroke-[1px] pointer-events-none"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v12m6-6H6"
                    />
                  </svg>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const Boxes = React.memo(BoxesCore);
