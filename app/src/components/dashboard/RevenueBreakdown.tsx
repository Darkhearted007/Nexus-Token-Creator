'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Segment {
  label: string;
  value: number;
  color: string;
}

const SEGMENTS: Segment[] = [
  { label: 'Volume Bots', value: 60, color: '#8b5cf6' },
  { label: 'Sniper Bots', value: 25, color: '#6366f1' },
  { label: 'Base Fees', value: 10, color: '#10b981' },
  { label: 'Authorities', value: 5, color: '#f59e0b' },
];

export default function RevenueBreakdown() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrame = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startTime = performance.now();

    const draw = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / 1200, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      const dpr = window.devicePixelRatio || 1;
      const size = 180;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
      ctx.scale(dpr, dpr);

      const cx = size / 2;
      const cy = size / 2;
      const outerR = 70;
      const innerR = 48;

      ctx.clearRect(0, 0, size, size);

      const total = SEGMENTS.reduce((s, seg) => s + seg.value, 0);
      let startAngle = -Math.PI / 2;

      SEGMENTS.forEach((seg) => {
        const sliceAngle = (seg.value / total) * Math.PI * 2 * eased;

        ctx.beginPath();
        ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
        ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();

        // Gap between segments
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, startAngle + sliceAngle - 0.02, startAngle + sliceAngle + 0.02);
        ctx.arc(cx, cy, innerR, startAngle + sliceAngle + 0.02, startAngle + sliceAngle - 0.02, true);
        ctx.closePath();
        ctx.fillStyle = '#0a0a0a';
        ctx.fill();

        startAngle += sliceAngle;
      });

      // Center circle
      ctx.beginPath();
      ctx.arc(cx, cy, innerR - 1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(17, 17, 27, 0.95)';
      ctx.fill();

      // Center text
      if (progress > 0.5) {
        const textOpacity = Math.min((progress - 0.5) * 2, 1);
        ctx.globalAlpha = textOpacity;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Revenue', cx, cy - 8);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '11px Inter, system-ui, sans-serif';
        ctx.fillText('Breakdown', cx, cy + 10);
        ctx.globalAlpha = 1;
      }

      if (progress < 1) {
        animFrame.current = requestAnimationFrame(draw);
      }
    };

    animFrame.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrame.current);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.55 }}
      className="glass-card p-5"
    >
      <h3 className="text-sm font-semibold text-white mb-5">Revenue Breakdown</h3>
      <div className="flex items-center gap-6">
        <canvas ref={canvasRef} className="flex-shrink-0" />
        <div className="space-y-3 flex-1 min-w-0">
          {SEGMENTS.map((seg) => (
            <div key={seg.label} className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
              <div className="flex items-center justify-between flex-1 min-w-0">
                <span className="text-xs text-gray-400 truncate">{seg.label}</span>
                <span className="text-xs font-semibold text-gray-200 ml-2">{seg.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
