'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface DataPoint {
  label: string;
  value: number;
}

const DEMO_DATA: DataPoint[] = [
  { label: 'Jan', value: 12 },
  { label: 'Feb', value: 28 },
  { label: 'Mar', value: 19 },
  { label: 'Apr', value: 45 },
  { label: 'May', value: 38 },
  { label: 'Jun', value: 62 },
  { label: 'Jul', value: 55 },
  { label: 'Aug', value: 78 },
  { label: 'Sep', value: 67 },
  { label: 'Oct', value: 89 },
  { label: 'Nov', value: 92 },
  { label: 'Dec', value: 105 },
];

export default function TokenTrendsChart({ data }: { data?: DataPoint[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; value: number } | null>(null);
  const chartData = data ?? DEMO_DATA;
  const animProgress = useRef(0);
  const animFrame = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeObserver = new ResizeObserver(() => {
      drawChart(1);
    });
    resizeObserver.observe(container);

    // Animate in
    animProgress.current = 0;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      animProgress.current = Math.min(elapsed / 1000, 1);
      const eased = 1 - Math.pow(1 - animProgress.current, 3);
      drawChart(eased);
      if (animProgress.current < 1) {
        animFrame.current = requestAnimationFrame(animate);
      }
    };

    animFrame.current = requestAnimationFrame(animate);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animFrame.current);
    };
  }, [chartData]);

  const drawChart = (progress: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    ctx.clearRect(0, 0, w, h);

    const maxVal = Math.max(...chartData.map((d) => d.value)) * 1.15;
    const stepX = chartW / (chartData.length - 1);

    // Grid lines
    const gridLines = 4;
    ctx.setLineDash([4, 4]);
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartH / gridLines) * i;
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      const val = Math.round(maxVal - (maxVal / gridLines) * i);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = '11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(String(val), padding.left - 10, y + 4);
    }
    ctx.setLineDash([]);

    // X-axis labels
    chartData.forEach((d, i) => {
      const x = padding.left + stepX * i;
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = '11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.label, x, h - 10);
    });

    // Build points
    const points = chartData.map((d, i) => ({
      x: padding.left + stepX * i,
      y: padding.top + chartH - (d.value / maxVal) * chartH * progress,
    }));

    // Area fill gradient
    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.25)');
    gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.08)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const cp1x = points[i - 1].x + stepX * 0.4;
      const cp1y = points[i - 1].y;
      const cp2x = points[i].x - stepX * 0.4;
      const cp2y = points[i].y;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length - 1].x, h - padding.bottom);
    ctx.lineTo(points[0].x, h - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    const lineGrad = ctx.createLinearGradient(padding.left, 0, w - padding.right, 0);
    lineGrad.addColorStop(0, '#8b5cf6');
    lineGrad.addColorStop(1, '#6366f1');

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const cp1x = points[i - 1].x + stepX * 0.4;
      const cp1y = points[i - 1].y;
      const cp2x = points[i].x - stepX * 0.4;
      const cp2y = points[i].y;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i].x, points[i].y);
    }
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Dots
    if (progress >= 1) {
      points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#8b5cf6';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const padding = { left: 50, right: 20, top: 20, bottom: 40 };
    const chartW = rect.width - padding.left - padding.right;
    const stepX = chartW / (chartData.length - 1);
    const mouseX = e.clientX - rect.left - padding.left;
    const idx = Math.round(mouseX / stepX);

    if (idx >= 0 && idx < chartData.length) {
      const maxVal = Math.max(...chartData.map((d) => d.value)) * 1.15;
      const chartH = rect.height - padding.top - padding.bottom;
      setTooltip({
        x: padding.left + stepX * idx,
        y: padding.top + chartH - (chartData[idx].value / maxVal) * chartH,
        label: chartData[idx].label,
        value: chartData[idx].value,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Token Creation Trends</h3>
        <span className="text-[11px] text-gray-500 bg-white/[0.03] px-2.5 py-1 rounded-lg">Last 12 Months</span>
      </div>
      <div
        ref={containerRef}
        className="relative h-[240px] w-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        <canvas ref={canvasRef} className="absolute inset-0" />
        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute pointer-events-none z-10 animate-fade-in"
            style={{ left: tooltip.x - 40, top: tooltip.y - 52 }}
          >
            <div className="bg-gray-800/95 backdrop-blur-lg border border-white/10 rounded-lg px-3 py-2 shadow-xl">
              <p className="text-[10px] text-gray-400">{tooltip.label}</p>
              <p className="text-sm font-bold text-white">{tooltip.value} Tokens</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
