import React from 'react';
import { cn } from '@/lib/utils';

interface SpecLegendItem {
  label: string;
  color: string;
  type: 'line' | 'box';
}

interface SpecLegendProps {
  items: SpecLegendItem[];
  className?: string;
}

export function SpecLegend({
  items,
  className,
}: SpecLegendProps) {
  return (
    <div
      className={cn(
        "p-4 bg-card rounded-lg shadow-md",
        className
      )}
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">Легенда</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            {item.type === 'line' ? (
              <div
                className="w-8 h-1"
                style={{ backgroundColor: item.color }}
              ></div>
            ) : (
              <div
                className="w-4 h-4"
                style={{ backgroundColor: item.color }}
              ></div>
            )}
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
