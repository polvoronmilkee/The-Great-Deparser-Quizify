function normalizeType(rawType) {
  const value = String(rawType ?? "")
    .trim()
    .toLowerCase();
  if (["a", "mcq", "multiple_choice", "multiple-choice"].includes(value))
    return "A";
  if (["b", "true_false", "true-false", "boolean", "tf"].includes(value))
    return "B";
  if (["c", "fill_blank", "fill-in-the-blank", "fill"].includes(value))
    return "C";
  if (["d", "essay", "long"].includes(value)) return "D";
  return null;
}

function normalizeQuestion(rawQuestion, index) {
  const type = normalizeType(rawQuestion.type);
  if (!type) {
    throw new Error(
      `Question ${index + 1}: invalid type. Use A/B/C/D or aliases like mcq, true_false, fill_blank, essay.`,
    );
  }

  const prompt = String(
    rawQuestion.question ?? rawQuestion.prompt ?? "",
  ).trim();
  if (!prompt) {
    throw new Error(`Question ${index + 1}: missing question text.`);
  }

  const normalized = {
    id: rawQuestion.id ?? `q-${index + 1}`,
    type,
    prompt,
    options: [],
    answer: rawQuestion.answer,
    keywords: [],
    explanation: rawQuestion.explanation ? String(rawQuestion.explanation) : "",
  };

  if (type === "A") {
    const options = Array.isArray(rawQuestion.options)
      ? rawQuestion.options.map((x) => String(x))
      : [];
    if (options.length < 2) {
      throw new Error(`Question ${index + 1}: MCQ needs at least 2 options.`);
    }
    normalized.options = options;
    const answerText = String(rawQuestion.answer ?? "").trim();
    if (!answerText || !options.includes(answerText)) {
      throw new Error(
        `Question ${index + 1}: MCQ answer must exactly match one option.`,
      );
    }
    normalized.answer = answerText;
  }

  if (type === "B") {
    const answer = rawQuestion.answer;
    if (typeof answer === "boolean") {
      normalized.answer = answer;
    } else if (typeof answer === "string") {
      const lowered = answer.trim().toLowerCase();
      if (lowered === "true") normalized.answer = true;
      else if (lowered === "false") normalized.answer = false;
      else
        throw new Error(
          `Question ${index + 1}: True/False answer must be true or false.`,
        );
    } else {
      throw new Error(
        `Question ${index + 1}: True/False answer must be true or false.`,
      );
    }
  }

  if (type === "C") {
    const answerText = String(rawQuestion.answer ?? "").trim();
    if (!answerText) {
      throw new Error(
        `Question ${index + 1}: Fill-in-the-blank needs an answer.`,
      );
    }
    normalized.answer = answerText;
  }

  if (type === "D") {
    const rawKeywords =
      rawQuestion.keywords ?? rawQuestion.answerKeywords ?? rawQuestion.answer;
    const asArray = Array.isArray(rawKeywords)
      ? rawKeywords
      : String(rawKeywords ?? "")
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean);

    normalized.keywords = asArray.map((word) => String(word).toLowerCase());

    if (normalized.keywords.length === 0) {
      throw new Error(
        `Question ${index + 1}: Essay needs keywords (keywords array or comma-separated answer).`,
      );
    }

    normalized.answer = normalized.keywords.join(", ");
  }

  return normalized;
}

export function parseQuizInput(rawInput) {
  let parsed;
  try {
    parsed = JSON.parse(rawInput);
  } catch {
    throw new Error(
      "Invalid JSON. Please paste a valid JSON array of questions.",
    );
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Input must be a non-empty JSON array of questions.");
  }

  return parsed.map((item, index) => normalizeQuestion(item, index));
}

function compareText(a, b) {
  return (
    String(a ?? "")
      .trim()
      .toLowerCase() ===
    String(b ?? "")
      .trim()
      .toLowerCase()
  );
}

function gradeEssay(question, userAnswer) {
  const text = String(userAnswer ?? "").toLowerCase();
  const keywords = question.keywords ?? [];

  const matched = keywords.filter((keyword) => text.includes(keyword)).length;
  const ratio = keywords.length > 0 ? matched / keywords.length : 0;

  return {
    matched,
    totalKeywords: keywords.length,
    ratio,
    isCorrect: ratio >= 0.6,
  };
}

export function evaluateQuiz(questions, answersById) {
  const results = questions.map((question, index) => {
    const userAnswer = answersById[question.id];
    let isCorrect = false;
    let essayMatch = null;

    if (question.type === "A" || question.type === "C") {
      isCorrect = compareText(userAnswer, question.answer);
    }

    if (question.type === "B") {
      isCorrect = Boolean(userAnswer) === Boolean(question.answer);
      if (typeof userAnswer !== "boolean") isCorrect = false;
    }

    if (question.type === "D") {
      essayMatch = gradeEssay(question, userAnswer);
      isCorrect = essayMatch.isCorrect;
    }

    return {
      id: question.id,
      number: index + 1,
      type: question.type,
      prompt: question.prompt,
      options: question.options,
      expected: question.type === "D" ? question.keywords : question.answer,
      userAnswer: userAnswer ?? "",
      isCorrect,
      essayMatch,
    };
  });

  const correctCount = results.filter((item) => item.isCorrect).length;
  const total = results.length;
  const percentage = total === 0 ? 0 : Math.round((correctCount / total) * 100);

  return {
    results,
    summary: {
      correctCount,
      total,
      percentage,
    },
  };
}

export function evaluateQuestion(question, userAnswer) {
  let isCorrect = false;
  let essayMatch = null;

  if (question.type === "A" || question.type === "C") {
    isCorrect = compareText(userAnswer, question.answer);
  }

  if (question.type === "B") {
    isCorrect = Boolean(userAnswer) === Boolean(question.answer);
    if (typeof userAnswer !== "boolean") isCorrect = false;
  }

  if (question.type === "D") {
    essayMatch = gradeEssay(question, userAnswer);
    isCorrect = essayMatch.isCorrect;
  }

  return {
    id: question.id,
    type: question.type,
    expected: question.type === "D" ? question.keywords : question.answer,
    userAnswer: userAnswer ?? "",
    isCorrect,
    essayMatch,
  };
}

export function getDefaultSampleJson() {
  return JSON.stringify(
    [
      {
        type: "A",
        question: "What is the capital of France?",
        options: ["Berlin", "Madrid", "Paris", "Rome"],
        answer: "Paris",
      },
      {
        type: "B",
        question: "The Earth is flat.",
        answer: false,
      },
      {
        type: "C",
        question: "React is maintained by ____.",
        answer: "Meta",
      },
      {
        type: "D",
        question: "Explain what HTTP status code 404 means.",
        keywords: ["not found", "resource", "client error"],
      },
    ],
    null,
    2,
  );
}
