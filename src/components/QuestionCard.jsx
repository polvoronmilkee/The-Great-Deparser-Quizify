function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  answer,
  onAnswerChange,
  feedback,
  answered,
}) {
  const baseButtonClass =
    "w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition";

  return (
    <article className="rounded-3xl border border-sky-200 bg-white/90 p-6 shadow-lg shadow-sky-100/60">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
          Set {question.type} • Question {questionNumber} / {totalQuestions}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-800">
          {question.prompt}
        </h2>
      </header>

      {answered && feedback && (
        <div
          className={`mt-4 rounded-xl px-4 py-2 text-sm font-semibold ${
            feedback.isCorrect
              ? "border border-emerald-100 bg-emerald-50 text-emerald-800"
              : "border border-rose-100 bg-rose-50 text-rose-800"
          }`}
        >
          {feedback.isCorrect ? "Correct" : "Incorrect"}
          {feedback.type === "D" && feedback.essayMatch && (
            <span className="ml-2 font-normal">
              — matched {feedback.essayMatch.matched}/
              {feedback.essayMatch.totalKeywords} keywords
            </span>
          )}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {question.type === "A" &&
          question.options.map((option) => {
            const isSelected = answer === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onAnswerChange(option)}
                className={`${baseButtonClass} ${
                  isSelected
                    ? "border-sky-500 bg-sky-100 text-sky-900"
                    : "border-sky-200 bg-white hover:border-sky-400 hover:bg-sky-50"
                }`}
              >
                {option}
              </button>
            );
          })}

        {question.type === "B" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onAnswerChange(true)}
              className={`${baseButtonClass} ${
                answer === true
                  ? "border-sky-500 bg-sky-100 text-sky-900"
                  : "border-sky-200 bg-white hover:border-sky-400 hover:bg-sky-50"
              }`}
            >
              True
            </button>
            <button
              type="button"
              onClick={() => onAnswerChange(false)}
              className={`${baseButtonClass} ${
                answer === false
                  ? "border-sky-500 bg-sky-100 text-sky-900"
                  : "border-sky-200 bg-white hover:border-sky-400 hover:bg-sky-50"
              }`}
            >
              False
            </button>
          </div>
        )}

        {question.type === "C" && (
          <input
            value={typeof answer === "string" ? answer : ""}
            onChange={(event) => onAnswerChange(event.target.value)}
            placeholder="Type your answer"
            className="w-full rounded-xl border border-sky-200 bg-sky-50/40 px-4 py-3 text-sm text-slate-800 outline-none ring-sky-300 transition focus:ring"
          />
        )}

        {question.type === "D" && (
          <textarea
            value={typeof answer === "string" ? answer : ""}
            onChange={(event) => onAnswerChange(event.target.value)}
            placeholder="Write your explanation"
            className="min-h-45 w-full rounded-xl border border-sky-200 bg-sky-50/40 px-4 py-3 text-sm text-slate-800 outline-none ring-sky-300 transition focus:ring"
          />
        )}
      </div>
    </article>
  );
}

export default QuestionCard;
