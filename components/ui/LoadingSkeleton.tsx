import React from "react";

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  ...props
}) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-cream-dark/60 ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl border border-cream-dark bg-white p-6 shadow-sm space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between border-b border-cream-dark pb-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-8 w-32" />
      </div>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-4 py-3 border-b border-cream-dark/50">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
};
