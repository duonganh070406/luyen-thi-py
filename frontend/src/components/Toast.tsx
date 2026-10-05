import { AnimatePresence, motion } from 'motion/react';

interface ToastProps {
  message: string | null;
}

export default function Toast({ message }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className="fixed top-6 right-6 z-[9999] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 font-medium text-sm"
        >
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
