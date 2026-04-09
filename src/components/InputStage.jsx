function InputStage({
  quizTitle,
  quizDescription,
  onQuizTitleChange,
  onQuizDescriptionChange,
  rawInput,
  onRawInputChange,
  onStart,
  errorText,
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <article className="rounded-3xl border border-sky-200 bg-white/90 p-6 shadow-lg shadow-sky-100/60">
        <h2 className="text-2xl font-bold text-slate-800">Paste your quiz JSON</h2>
        <p className="mt-2 text-sm text-slate-600">
          Supports Set A (MCQ), Set B (True/False), Set C (Fill in the Blank), and Set D (Essay with keywords).
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            value={quizTitle}
            onChange={(event) => onQuizTitleChange(event.target.value)}
            placeholder="Quiz title"
            className="w-full rounded-xl border border-sky-200 bg-sky-50/40 px-4 py-3 text-sm text-slate-800 outline-none ring-sky-300 transition focus:ring"
          />
          <input
            value={quizDescription}
            onChange={(event) => onQuizDescriptionChange(event.target.value)}
            placeholder="Short description"
            className="w-full rounded-xl border border-sky-200 bg-sky-50/40 px-4 py-3 text-sm text-slate-800 outline-none ring-sky-300 transition focus:ring"
          />
        </div>

        <textarea
          value={rawInput}
          onChange={(event) => onRawInputChange(event.target.value)}
          spellCheck={false}
          className="mt-4 min-h-90 w-full rounded-2xl border border-sky-200 bg-sky-50/40 p-4 font-mono text-sm text-slate-800 outline-none ring-sky-300 transition focus:ring"
          placeholder="Paste JSON here..."
        />

        {errorText && (
          <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorText}
          </p>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onStart}
            className="rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-sky-300 transition hover:bg-sky-700"
          >
            Start Quiz
          </button>
        </div>
      </article>

      <article className="rounded-3xl border border-blue-200 bg-linear-to-b from-sky-50 to-blue-50 p-6">
        <h3 className="text-lg font-semibold text-slate-800">Expected JSON shape</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Provide an array of questions. Use <strong>type</strong> as <strong>A</strong>, <strong>B</strong>, <strong>C</strong>, or <strong>D</strong>.
        </p>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          <li><strong>A</strong>: requires <strong>options</strong> + exact <strong>answer</strong>.</li>
          <li><strong>B</strong>: <strong>answer</strong> should be true or false.</li>
          <li><strong>C</strong>: text <strong>answer</strong> checked case-insensitively.</li>
          <li><strong>D</strong>: add <strong>keywords</strong> array for matching.</li>
        </ul>
      </article>
    </section>
  )
}

export default InputStage
