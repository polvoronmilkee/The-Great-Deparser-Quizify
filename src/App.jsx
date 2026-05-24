import { useEffect, useMemo, useState } from "react";
import InputStage from "./components/InputStage";
import ProgressBar from "./components/ProgressBar";
import QuestionCard from "./components/QuestionCard";
import QuizHistory from "./components/QuizHistory";
import ResultsStage from "./components/ResultsStage";
import {
  evaluateQuiz,
  evaluateQuestion,
  getDefaultSampleJson,
  parseQuizInput,
} from "./utils/quiz";
import {
  clearSession,
  loadHistory,
  loadSession,
  saveHistory,
  saveSession,
} from "./utils/storage";

function hasAnswer(question, answer) {
  if (question.type === "B") return typeof answer === "boolean";
  return String(answer ?? "").trim().length > 0;
}

function buildRawInputFromAttempt(attempt) {
  if (attempt?.rawInput) return attempt.rawInput;

  const results = attempt?.evaluation?.results;
  if (!Array.isArray(results) || results.length === 0) return "";

  const reconstructed = results.map((item) => {
    if (item.type === "A") {
      return {
        type: "A",
        question: item.prompt,
        options: Array.isArray(item.options) ? item.options : [],
        answer: item.expected,
      };
    }

    if (item.type === "B") {
      return {
        type: "B",
        question: item.prompt,
        answer: Boolean(item.expected),
      };
    }

    if (item.type === "C") {
      return {
        type: "C",
        question: item.prompt,
        answer: item.expected,
      };
    }

    return {
      type: "D",
      question: item.prompt,
      keywords: Array.isArray(item.expected) ? item.expected : [],
    };
  });

  return JSON.stringify(reconstructed, null, 2);
}

function App() {
  const restoredSession = useMemo(() => loadSession(), []);

  const [stage, setStage] = useState(restoredSession?.stage ?? "input");
  const [quizTitle, setQuizTitle] = useState(
    restoredSession?.quizTitle ?? "My Quiz",
  );
  const [quizDescription, setQuizDescription] = useState(
    restoredSession?.quizDescription ?? "",
  );
  const [rawInput, setRawInput] = useState(
    restoredSession?.rawInput ?? getDefaultSampleJson(),
  );
  const [questions, setQuestions] = useState(restoredSession?.questions ?? []);
  const [currentIndex, setCurrentIndex] = useState(
    restoredSession?.currentIndex ?? 0,
  );
  const [answersById, setAnswersById] = useState(
    restoredSession?.answersById ?? {},
  );
  const [evaluation, setEvaluation] = useState(
    restoredSession?.evaluation ?? null,
  );
  const [history, setHistory] = useState(() => loadHistory());
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    saveSession({
      stage,
      quizTitle,
      quizDescription,
      rawInput,
      questions,
      currentIndex,
      answersById,
      evaluation,
    });
  }, [
    stage,
    quizTitle,
    quizDescription,
    rawInput,
    questions,
    currentIndex,
    answersById,
    evaluation,
  ]);

  const answeredCount = questions.filter((question) =>
    hasAnswer(question, answersById[question.id]),
  ).length;

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const currentFeedback =
    currentQuestion && answersById
      ? evaluateQuestion(currentQuestion, answersById[currentQuestion.id])
      : null;
  const currentAnswered = currentQuestion
    ? hasAnswer(currentQuestion, answersById[currentQuestion.id])
    : false;

  function handleStartQuiz() {
    try {
      const parsedQuestions = parseQuizInput(rawInput);
      setQuestions(parsedQuestions);
      setAnswersById({});
      setCurrentIndex(0);
      setEvaluation(null);
      setStage("playing");
      setErrorText("");
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Failed to parse quiz input.",
      );
    }
  }

  function updateCurrentAnswer(value) {
    const question = questions[currentIndex];
    if (!question) return;
    setAnswersById((previous) => ({
      ...previous,
      [question.id]: value,
    }));
  }

  function handleSubmitQuiz() {
    const scored = evaluateQuiz(questions, answersById);
    setEvaluation(scored);
    setStage("finished");

    const nextHistory = [
      ...history,
      {
        id: crypto.randomUUID(),
        finishedAt: new Date().toISOString(),
        correctCount: scored.summary.correctCount,
        total: scored.summary.total,
        percentage: scored.summary.percentage,
        wrongPrompts: scored.results
          .filter((item) => !item.isCorrect)
          .map((item) => item.prompt),
        title: quizTitle,
        description: quizDescription,
        evaluation: scored,
        rawInput,
      },
    ];

    setHistory(nextHistory);
    saveHistory(nextHistory);
  }

  function handleRetake() {
    setAnswersById({});
    setCurrentIndex(0);
    setEvaluation(null);
    setStage("playing");
  }

  function handleNewQuiz() {
    setStage("input");
    setQuizTitle("My Quiz");
    setQuizDescription("");
    setQuestions([]);
    setCurrentIndex(0);
    setAnswersById({});
    setEvaluation(null);
    setRawInput(getDefaultSampleJson());
    setErrorText("");
    clearSession();
  }

  function handleGoHome() {
    setStage("input");
    setErrorText("");
  }

  function handleRetakeFromHistory(attempt) {
    const attemptRawInput = buildRawInputFromAttempt(attempt);
    if (!attemptRawInput) {
      setErrorText(
        "This older quiz attempt cannot be retaken because its original questions are unavailable.",
      );
      setStage("input");
      return;
    }

    try {
      const parsedQuestions = parseQuizInput(attemptRawInput);
      setQuizTitle(attempt?.title || "Retake Quiz");
      setQuizDescription(attempt?.description || "");
      setRawInput(attemptRawInput);
      setQuestions(parsedQuestions);
      setAnswersById({});
      setCurrentIndex(0);
      setEvaluation(null);
      setErrorText("");
      setStage("playing");
    } catch {
      setErrorText(
        "Could not retake this attempt because its stored JSON is no longer valid.",
      );
      setStage("input");
    }
  }

  function handleEditAttempt(attempt) {
    const attemptRawInput = buildRawInputFromAttempt(attempt);
    if (!attemptRawInput) {
      setErrorText(
        "This older quiz attempt cannot be edited because its original questions are unavailable.",
      );
      setStage("input");
      return;
    }

    setQuizTitle(attempt?.title || "Retake Quiz");
    setQuizDescription(attempt?.description || "");
    setRawInput(attemptRawInput);
    setQuestions([]);
    setCurrentIndex(0);
    setAnswersById({});
    setEvaluation(null);
    setErrorText("");
    setStage("input");
  }

  function handleViewAttemptResults(attempt) {
    if (!attempt?.evaluation) {
      setErrorText("Detailed results are unavailable for this older attempt.");
      setStage("input");
      return;
    }

    const attemptRawInput = buildRawInputFromAttempt(attempt);
    if (attemptRawInput) {
      setRawInput(attemptRawInput);
      try {
        const parsedQuestions = parseQuizInput(attemptRawInput);
        setQuestions(parsedQuestions);
      } catch {
        setQuestions([]);
      }
    }

    setQuizTitle(attempt?.title || quizTitle);
    setQuizDescription(attempt?.description || "");
    setAnswersById({});
    setCurrentIndex(0);
    setEvaluation(attempt.evaluation);
    setErrorText("");
    setStage("finished");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f0f9ff_0%,#eff6ff_35%,#f8fafc_70%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <main className="mx-auto max-w-6xl space-y-6">
        <header className="relative overflow-hidden rounded-3xl border border-sky-200 bg-white/80 px-6 py-7 shadow-xl shadow-sky-100/60 backdrop-blur sm:px-8">
          <div className="pointer-events-none absolute -right-24 -top-16 h-52 w-52 rounded-full bg-sky-200/40 blur-2xl" />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
              Quizify
            </p>
            {stage !== "input" && (
              <button
                type="button"
                onClick={handleGoHome}
                className="rounded-xl border border-sky-300 bg-white/90 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
              >
                Home
              </button>
            )}
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
            {quizTitle || "Build quizzes from JSON and practice instantly"}
          </h1>
          {quizDescription ? (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              {quizDescription}
            </p>
          ) : (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Paste questions, generate your quiz, and track mistakes over time.
              Progress and pasted content are saved locally so refreshes do not
              reset your attempt.
            </p>
          )}
        </header>

        {stage === "input" && (
          <div className="space-y-6">
            <InputStage
              quizTitle={quizTitle}
              quizDescription={quizDescription}
              onQuizTitleChange={setQuizTitle}
              onQuizDescriptionChange={setQuizDescription}
              rawInput={rawInput}
              onRawInputChange={setRawInput}
              onStart={handleStartQuiz}
              errorText={errorText}
            />
            <QuizHistory
              history={history}
              onRetakeAttempt={handleRetakeFromHistory}
              onEditAttempt={handleEditAttempt}
              onViewAttemptResults={handleViewAttemptResults}
            />
          </div>
        )}

        {stage === "playing" && currentQuestion && (
          <section className="space-y-5">
            <ProgressBar
              current={currentIndex}
              total={questions.length}
              answered={answeredCount}
            />

            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              answer={answersById[currentQuestion.id]}
              onAnswerChange={updateCurrentAnswer}
              feedback={currentFeedback}
              answered={currentAnswered}
            />

            <div className="flex flex-wrap justify-between gap-3 rounded-2xl border border-sky-200 bg-white/80 p-4">
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((value) => Math.max(0, value - 1))
                }
                disabled={currentIndex === 0}
                className="rounded-xl border border-sky-300 bg-white px-5 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <div className="flex gap-3">
                {!isLastQuestion && (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex((value) =>
                        Math.min(questions.length - 1, value + 1),
                      )
                    }
                    className="rounded-xl border border-sky-300 bg-white px-5 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
                  >
                    Next
                  </button>
                )}

                {isLastQuestion && (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {stage === "finished" && evaluation && (
          <div className="space-y-6">
            <ResultsStage
              evaluation={evaluation}
              onRetake={handleRetake}
              onNewQuiz={handleNewQuiz}
            />
            <QuizHistory
              history={history}
              onRetakeAttempt={handleRetakeFromHistory}
              onEditAttempt={handleEditAttempt}
              onViewAttemptResults={handleViewAttemptResults}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
