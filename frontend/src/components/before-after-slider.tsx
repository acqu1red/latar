"use client"

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BeforeAfterSliderProps {
  beforeImg: string;
  afterImg: string;
  width?: number;
  height?: number;
  className?: string;
}

export function BeforeAfterSlider({
  beforeImg,
  afterImg,
  width = 600,
  height = 400,
  className,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50); // 0-100%

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const { left, width: containerWidth } = containerRef.current.getBoundingClientRect();
      const newPosition = ((e.clientX - left) / containerWidth) * 100;
      setSliderPosition(Math.max(0, Math.min(100, newPosition)));
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden cursor-ew-resize rounded-lg shadow-lg",
        className
      )}
      style={{ width: `${width}px`, height: `${height}px` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setSliderPosition(50)} // Reset on mouse leave
    >
      <img
        src={beforeImg}
        alt="Before"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      />
      <img
        src={afterImg}
        alt="After"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
      />

      <motion.div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-xl flex items-center justify-center"
        style={{ left: `${sliderPosition}%` }}
        drag="x"
        dragConstraints={containerRef}
        dragElastic={0}
        onDrag={(event, info) => {
          if (containerRef.current) {
            const { width: containerWidth } = containerRef.current.getBoundingClientRect();
            const newPosition = (info.point.x / containerWidth) * 100;
            setSliderPosition(Math.max(0, Math.min(100, newPosition)));
          }
        }}
      >
        <div className="w-8 h-8 rounded-full bg-primary-foreground flex items-center justify-center">
          <svg
            className="w-4 h-4 text-gray-800 dark:text-gray-100"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7l4-4m0 0l4 4m-4-4v18"
            ></path>
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
