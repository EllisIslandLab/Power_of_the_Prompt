'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

interface CategoryNodeProps {
  category: Category;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
  index: number;
  isCustomNode?: boolean;
  hasActiveHover?: boolean;
}

export function CategoryNode({
  category,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onLeave,
  index,
  isCustomNode = false,
  hasActiveHover = false
}: CategoryNodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{
        opacity: hasActiveHover && !isHovered ? 0.3 : 1,
        y: 0,
        scale: hasActiveHover && !isHovered ? 0.95 : 1,
        filter: hasActiveHover && !isHovered ? 'blur(4px)' : 'blur(0px)'
      }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        type: 'spring',
        stiffness: 100
      }}
      className="relative group perspective-1000"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      data-category-id={category.id}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Ice cube container with 3D effect */}
      <motion.div
        className="relative"
        animate={{
          rotateY: isHovered ? 15 : 0,
          rotateX: isHovered ? -10 : 0,
          z: isHovered ? 50 : 0
        }}
        transition={{
          duration: 0.6,
          type: 'spring',
          stiffness: 200
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Outer glow */}
        {(isSelected || isHovered) && (
          <motion.div
            className={cn(
              'absolute inset-0 rounded-3xl blur-2xl -z-10',
              isCustomNode
                ? 'bg-gradient-to-br from-yellow-400/50 to-orange-500/50'
                : 'bg-gradient-to-br from-cyan-400/50 to-blue-500/50'
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Ice cube button */}
        <motion.button
          onClick={onSelect}
          className={cn(
            'relative w-full h-52 rounded-3xl overflow-hidden transition-all duration-500',
            'backdrop-blur-xl shadow-2xl',
            // Ice cube glass effect
            'bg-gradient-to-br from-white/10 via-white/5 to-transparent',
            'border border-white/20',
            isSelected && 'ring-2 ring-cyan-400/50',
            isCustomNode && isSelected && 'ring-2 ring-yellow-400/50'
          )}
          style={{
            transformStyle: 'preserve-3d',
            boxShadow: isHovered
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
              : '0 10px 30px -10px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Inner ice reflections - multiple layers */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Top highlight */}
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 via-white/10 to-transparent" />

            {/* Diagonal shine */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"
              animate={{
                opacity: isHovered ? [0.3, 0.6, 0.3] : 0.3,
                x: isHovered ? ['-100%', '100%'] : '0%'
              }}
              transition={{
                opacity: { duration: 2, repeat: Infinity },
                x: { duration: 3, repeat: Infinity, ease: 'linear' }
              }}
            />

            {/* Ice crystals pattern */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id={`ice-pattern-${category.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="1" fill="white" opacity="0.5" />
                    <circle cx="10" cy="10" r="0.5" fill="white" opacity="0.3" />
                    <circle cx="30" cy="30" r="0.5" fill="white" opacity="0.3" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#ice-pattern-${category.id})`} />
              </svg>
            </div>

            {/* Frosted edges */}
            <div className="absolute inset-0 rounded-3xl border-2 border-white/10" />
            <div className="absolute inset-2 rounded-2xl border border-white/5" />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
            {/* Icon with ice effect */}
            <motion.div
              className="relative mb-4"
              animate={{
                scale: isHovered ? 1.2 : 1,
                rotateZ: isHovered ? [0, -5, 5, -5, 0] : 0
              }}
              transition={{
                scale: { duration: 0.3 },
                rotateZ: { duration: 0.6 }
              }}
            >
              {/* Icon glow */}
              <div className={cn(
                'absolute inset-0 blur-xl',
                isCustomNode
                  ? 'bg-yellow-400/50'
                  : 'bg-cyan-400/50'
              )} />
              <div className="relative text-7xl filter drop-shadow-2xl">
                {category.icon}
              </div>
            </motion.div>

            {/* Title */}
            <h3 className={cn(
              'text-2xl font-bold mb-2 transition-all duration-300',
              'bg-gradient-to-br bg-clip-text text-transparent',
              isSelected || isHovered
                ? isCustomNode
                  ? 'from-yellow-200 to-orange-300'
                  : 'from-cyan-200 to-blue-300'
                : 'from-slate-100 to-slate-300',
              'filter drop-shadow-lg'
            )}>
              {category.name}
            </h3>

            {/* Description */}
            <p className={cn(
              'text-sm transition-all duration-300',
              isSelected || isHovered ? 'text-slate-100' : 'text-slate-300'
            )}>
              {category.description}
            </p>

            {/* Selection indicator */}
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-2xl"
                  style={{
                    background: isCustomNode
                      ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)'
                  }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Custom badge */}
            {isCustomNode && (
              <div className="absolute top-4 left-4">
                <motion.span
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/30 text-yellow-200 border border-yellow-400/50 backdrop-blur-sm"
                  animate={{
                    scale: isHovered ? [1, 1.1, 1] : 1
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  ✨ Custom
                </motion.span>
              </div>
            )}
          </div>

          {/* Bottom frost effect */}
          <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
        </motion.button>

        {/* 3D depth layers */}
        <div
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/5 to-blue-600/5 -z-10"
          style={{
            transform: 'translateZ(-10px)',
            transformStyle: 'preserve-3d'
          }}
        />
        <div
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/3 to-blue-600/3 -z-20"
          style={{
            transform: 'translateZ(-20px)',
            transformStyle: 'preserve-3d'
          }}
        />
      </motion.div>
    </motion.div>
  );
}
