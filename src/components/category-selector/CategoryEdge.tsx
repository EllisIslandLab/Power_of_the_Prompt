'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CategoryEdgeProps {
  categoryId: string;
  subcategories: string[];
}

interface EdgeLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  id: string;
}

export function CategoryEdge({ categoryId, subcategories }: CategoryEdgeProps) {
  const [edges, setEdges] = useState<EdgeLine[]>([]);

  useEffect(() => {
    // Calculate edge positions
    const categoryElement = document.querySelector(`[data-category-id="${categoryId}"]`);

    if (!categoryElement) return;

    const categoryRect = categoryElement.getBoundingClientRect();
    const categoryCenterX = categoryRect.left + categoryRect.width / 2;
    const categoryCenterY = categoryRect.top + categoryRect.height / 2;

    const newEdges: EdgeLine[] = [];

    subcategories.forEach(subId => {
      const subElement = document.querySelector(`[data-subcategory-id="${subId}"]`);
      if (subElement) {
        const subRect = subElement.getBoundingClientRect();
        const subCenterX = subRect.left + subRect.width / 2;
        const subCenterY = subRect.top + subRect.height / 2;

        newEdges.push({
          x1: categoryCenterX,
          y1: categoryCenterY,
          x2: subCenterX,
          y2: subCenterY,
          id: `${categoryId}-${subId}`
        });
      }
    });

    setEdges(newEdges);
  }, [categoryId, subcategories]);

  if (edges.length === 0) return null;

  return (
    <svg
      className="fixed inset-0 pointer-events-none z-0"
      style={{ width: '100vw', height: '100vh' }}
    >
      <defs>
        <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(96, 165, 250)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.8" />
        </linearGradient>

        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {edges.map((edge, index) => (
        <g key={edge.id}>
          {/* Glow line */}
          <motion.line
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke="url(#edge-gradient)"
            strokeWidth="4"
            strokeOpacity="0.3"
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 0.6,
              delay: index * 0.05,
              ease: 'easeOut'
            }}
          />

          {/* Main line */}
          <motion.line
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke="url(#edge-gradient)"
            strokeWidth="2"
            strokeDasharray="5,5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: 1,
              strokeDashoffset: [0, -10]
            }}
            transition={{
              pathLength: { duration: 0.6, delay: index * 0.05 },
              opacity: { duration: 0.6, delay: index * 0.05 },
              strokeDashoffset: {
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear'
              }
            }}
          />

          {/* Animated particles */}
          <motion.circle
            r="3"
            fill="rgb(96, 165, 250)"
            filter="url(#glow)"
            initial={{ opacity: 0 }}
            animate={{
              cx: [edge.x1, edge.x2],
              cy: [edge.y1, edge.y2],
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: 2,
              delay: index * 0.1,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </g>
      ))}
    </svg>
  );
}
