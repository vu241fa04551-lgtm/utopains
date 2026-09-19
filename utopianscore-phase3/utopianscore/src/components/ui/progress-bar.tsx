export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2 w-full overflow-hidden rounded-full bg-ink-100"
    >
      <div
        className="h-full rounded-full bg-brand-orange transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
