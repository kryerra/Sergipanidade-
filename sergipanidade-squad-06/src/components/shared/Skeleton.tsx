import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={`animate-pulse bg-[var(--cinza-leve)] ${className}`}
    />
  );
}

export default Skeleton;
