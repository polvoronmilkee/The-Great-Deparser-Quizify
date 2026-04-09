const QUIZ_SESSION_KEY = 'quizify.session.v1'
const QUIZ_HISTORY_KEY = 'quizify.history.v1'

export function loadSession() {
  try {
    const raw = localStorage.getItem(QUIZ_SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveSession(session) {
  localStorage.setItem(QUIZ_SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(QUIZ_SESSION_KEY)
}

export function loadHistory() {
  try {
    const raw = localStorage.getItem(QUIZ_HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveHistory(history) {
  localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(history))
}

export const storageKeys = {
  QUIZ_SESSION_KEY,
  QUIZ_HISTORY_KEY,
}
