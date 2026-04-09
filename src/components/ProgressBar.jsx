function ProgressBar({ current, total, answered }) {
  const progress = total === 0 ? 0 : Math.round(((current + 1) / total) * 100);
  const answerProgress = total === 0 ? 0 : Math.round((answered / total) * 100);

  return (
    <div className="rounded-2xl border border-sky-200 bg-white/70 p-4 shadow-sm backdrop-blur">
      <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
        <span>
          Question {current + 1} of {total}
        </span>
        <span>
          {answered} answered ({answerProgress}%)
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-sky-100">
        <div
          className="h-full rounded-full bg-linear-to-r from-sky-500 to-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
