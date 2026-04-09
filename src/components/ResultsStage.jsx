function ResultsStage({ evaluation, onRetake, onNewQuiz }) {
  const { summary, results } = evaluation;

  return (
    <section className="space-y-5">
      <article className="rounded-3xl border border-sky-200 bg-white/90 p-6 shadow-lg shadow-sky-100/60">
        <h2 className="text-3xl font-bold text-slate-800">Quiz Complete</h2>
        <p className="mt-3 text-slate-600">
          Score:{" "}
          <span className="font-semibold text-slate-800">
            {summary.correctCount}/{summary.total}
          </span>{" "}
          ({summary.percentage}%)
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onRetake}
            className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            Retake Quiz
          </button>
          <button
            type="button"
            onClick={onNewQuiz}
            className="rounded-xl border border-sky-300 bg-white px-5 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
          >
            Start New Quiz Set
          </button>
        </div>
      </article>

      <div className="space-y-3">
        {results.map((item) => (
          <article
            key={item.id}
            className={`rounded-2xl border p-4 ${
              item.isCorrect
                ? "border-emerald-200 bg-emerald-50/70"
                : "border-rose-200 bg-rose-50/70"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-slate-800">
                Q{item.number}. {item.prompt}
              </h3>
              <span
                className={`text-sm font-semibold ${item.isCorrect ? "text-emerald-700" : "text-rose-700"}`}
              >
                {item.isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-700">
              Your answer: {String(item.userAnswer || "(empty)")}
            </p>

            {item.type === "D" ? (
              <p className="mt-1 text-sm text-slate-700">
                Keyword Match: {item.essayMatch?.matched ?? 0}/
                {item.essayMatch?.totalKeywords ?? 0} (
                {Math.round((item.essayMatch?.ratio ?? 0) * 100)}%)
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-700">
                Expected answer: {String(item.expected)}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default ResultsStage;
