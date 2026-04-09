function QuizHistory({
  history,
  onRetakeAttempt,
  onEditAttempt,
  onViewAttemptResults,
}) {
  if (history.length === 0) {
    return (
      <article className="rounded-2xl border border-sky-200 bg-white/70 p-4 text-sm text-slate-600">
        No attempts yet. Your results history will appear here.
      </article>
    )
  }

  const weakAreasMap = {}
  history.forEach((attempt) => {
    attempt.wrongPrompts.forEach((prompt) => {
      weakAreasMap[prompt] = (weakAreasMap[prompt] ?? 0) + 1
    })
  })

  const topWeakAreas = Object.entries(weakAreasMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  return (
    <section className="space-y-4">
      <article className="rounded-2xl border border-sky-200 bg-white/70 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-sky-700">Quiz history</h3>
        <div className="mt-3 space-y-2">
          {history.slice().reverse().slice(0, 8).map((attempt) => {
            const canOpenFromSavedData = Boolean(
              attempt.rawInput || attempt?.evaluation?.results,
            )
            const canViewResults = Boolean(attempt.evaluation)

            return (
              <div key={attempt.id} className="rounded-xl bg-sky-50/70 px-3 py-2 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-slate-700">
                    {new Date(attempt.finishedAt).toLocaleString()}
                    {attempt.title ? ` - ${attempt.title}` : ""}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {attempt.correctCount}/{attempt.total} ({attempt.percentage}%)
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    disabled={!canViewResults}
                    onClick={() => onViewAttemptResults?.(attempt)}
                    className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                    title={canViewResults ? "Open saved detailed results" : "Unavailable for older attempts"}
                  >
                    View Results
                  </button>
                  <button
                    type="button"
                    disabled={!canOpenFromSavedData}
                    onClick={() => onEditAttempt?.(attempt)}
                    className="rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                    title={canOpenFromSavedData ? "Load this quiz into editor" : "Unavailable for older attempts"}
                  >
                    Edit Quiz
                  </button>
                  <button
                    type="button"
                    onClick={() => onRetakeAttempt?.(attempt)}
                    className="rounded-lg border border-sky-300 bg-white px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-50"
                    title="Retake this quiz now"
                  >
                    Retake This Quiz
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </article>

      <article className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-700">Where to improve</h3>
        {topWeakAreas.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">Great consistency so far.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {topWeakAreas.map(([prompt, misses]) => (
              <li key={prompt} className="rounded-xl bg-white/80 px-3 py-2">
                Missed {misses} time{misses > 1 ? 's' : ''}: {prompt}
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  )
}

export default QuizHistory
