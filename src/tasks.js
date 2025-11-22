import { parseISO, isValid as isValidDate } from "date-fns";

// ---------- Helpers ----------

const isValidString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const isValidDateString = (value) => {
  if (typeof value !== "string" || !value.trim()) return false;
  const parsed = parseISO(value);
  return isValidDate(parsed);
};

const normalizePriority = (value) => {
  const allowed = ["low", "medium", "high"];
  if (value == null) return "";
  const normalized = String(value).toLowerCase();
  return allowed.includes(normalized) ? normalized : "";
};

function normalizeTaskInput(raw = {}) {
  const {
    title = "",
    description = "",
    dueDate = "",
    priority = "",
    note = "",
    check = false,
  } = raw;

  return {
    title: isValidString(title) ? title.trim() : "",
    description: isValidString(description) ? description.trim() : "",
    dueDate: isValidDateString(dueDate) ? dueDate : "",
    priority: normalizePriority(priority),
    note: isValidString(note) ? note.trim() : "",
    check: typeof check === "boolean" ? check : false,
  };
}

// ---------- Mixins ----------

const hasTitle = (state) => ({
  setTitle(newTitle) {
    if (isValidString(newTitle)) {
      state.title = newTitle.trim();
    }
  },
  getTitle() {
    return state.title;
  },
});

const hasDescription = (state) => ({
  setDescription(newDescription) {
    if (isValidString(newDescription)) {
      state.description = newDescription.trim();
    }
  },
  getDescription() {
    return state.description;
  },
});

const hasDueDate = (state) => ({
  setDueDate(newDueDate) {
    if (!isValidDateString(newDueDate)) return;
    state.dueDate = newDueDate; // store ISO string like "2025-11-21"
  },
  clearDueDate() {
    state.dueDate = "";
  },
  getDueDate() {
    return state.dueDate;
  },
});

const hasPriority = (state) => ({
  setPriority(newPriority) {
    const normalized = normalizePriority(newPriority);
    if (!normalized) return;
    state.priority = normalized; // "low" | "medium" | "high"
  },
  clearPriority() {
    state.priority = "";
  },
  getPriority() {
    return state.priority;
  },
});

const hasNote = (state) => ({
  setNote(newNote) {
    if (isValidString(newNote)) {
      state.note = newNote.trim();
    }
  },
  clearNote() {
    state.note = "";
  },
  getNote() {
    return state.note;
  },
});

const hasCheck = (state) => ({
  setCheck(value) {
    if (typeof value === "boolean") {
      state.check = value;
    }
  },
  toggleCheck() {
    state.check = !state.check;
  },
  clearCheck() {
    state.check = false;
  },
  isChecked() {
    return state.check;
  },
});

// ---------- Factory ----------

export default function makeTask(raw = {}) {
  const state = normalizeTaskInput(raw);

  return {
    ...hasTitle(state),
    ...hasDescription(state),
    ...hasDueDate(state),
    ...hasPriority(state),
    ...hasNote(state),
    ...hasCheck(state),

    // Handy for rendering + localStorage
    getState() {
      return { ...state };
    },
  };
}
