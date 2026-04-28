import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface FloatingCardProps {
  children: ReactNode;
  className?: string;
}

export default function FloatingCard({ children, className = '' }: FloatingCardProps) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className={`bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}
