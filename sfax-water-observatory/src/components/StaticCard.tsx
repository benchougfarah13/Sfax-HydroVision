import { ReactNode } from 'react';

interface StaticCardProps {
  children: ReactNode;
  className?: string;
}

export default function StaticCard({ children, className = '' }: StaticCardProps) {
  return (
    <div className={`bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl ${className}`}>
      {children}
    </div>
  );
}
