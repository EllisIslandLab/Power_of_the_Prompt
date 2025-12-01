'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
}

interface SubcategoryNodeProps {
  subcategory: Subcategory;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
  parentCategoryId: string;
}

export function SubcategoryNode({
  subcategory,
  isSelected,
  onSelect,
  index,
  parentCategoryId
}: SubcategoryNodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        type: 'spring',
        stiffness: 120
      }}
      className="relative"
      data-subcategory-id={subcategory.id}
    >
      {/* Glow on selection */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 blur-lg -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
        />
      )}

      <motion.button
        onClick={onSelect}
        className={cn(
          'relative w-full h-32 rounded-xl overflow-hidden transition-all duration-300',
          'backdrop-blur-sm',
          isSelected
            ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-purple-400 shadow-xl shadow-purple-500/30'
            : 'bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/80'
        )}
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Decorative elements */}
        <div className="absolute top-2 right-2 w-16 h-16 border border-white/10 rounded-lg transform rotate-12 opacity-30"></div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 text-center">
          <h4 className={cn(
            'text-base font-semibold mb-1 transition-colors',
            isSelected ? 'text-white' : 'text-slate-200'
          )}>
            {subcategory.name}
          </h4>

          <p className={cn(
            'text-xs transition-colors line-clamp-2',
            isSelected ? 'text-slate-300' : 'text-slate-400'
          )}>
            {subcategory.description}
          </p>

          {/* Selection Check */}
          {isSelected && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute top-3 right-3"
            >
              <CheckCircle2 className="w-6 h-6 text-purple-400" />
            </motion.div>
          )}
        </div>

        {/* Shimmer effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
          initial={{ x: '-100%' }}
          whileHover={{ x: '200%' }}
          transition={{ duration: 0.6 }}
        />
      </motion.button>
    </motion.div>
  );
}
