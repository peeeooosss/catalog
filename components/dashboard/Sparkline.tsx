import { cn } from '@/lib/utils';

export default function Sparkline({
  values,
  color = '#10b981',
  className,
}: {
  values: number[];
  color?: string;
  className?: string;
}) {
  const safe = values.length ? values : [0, 0];
  const max = Math.max(1, ...safe);
  const denominator = Math.max(1, safe.length - 1);
  const points = safe
    .map((value, index) => {
      const x = (index / denominator) * 100;
      const y = 30 - (value / max) * 26;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const lastY = 30 - (safe[safe.length - 1] / max) * 26;

  return (
    <svg
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      className={cn('h-12 w-full overflow-visible', className)}
      role="img"
      aria-label="Trend over time"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx="100" cy={lastY} r="2" fill={color} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
