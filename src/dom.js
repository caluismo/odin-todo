import makeProject from "./project.js";
import makeTask from "./tasks.js";
import { save } from "./storage.js";

let projectContainer;
let mainContent;

export function initUI(manager) {
    projectContainer = document.querySelector("#project-container");
    mainContent = document.querySelector("#main-content");

    if(!projectContainer || !mainContent) {
        console.error("DOM containers not found. Check your HTML IDs.");
        return;
    }

    renderProjects(manager);
    renderTasks(manager.getActiveProject(), manager);
}

function renderProjects(manager) {
  projectContainer.innerHTML = "";

  const controls = buildProjectControls(manager);
  projectContainer.appendChild(controls);

  const list = document.createElement("div");
  list.classList.add("project-list");

  const projects = manager.getProjects();
  const activeProject = manager.getActiveProject();

  const fragment = document.createDocumentFragment();
  projects.forEach((project) => {
    const row = document.createElement("div");
    row.classList.add("project-row");

    const projectButton = document.createElement("button");
    projectButton.classList.add("project-btn");
    if (project === activeProject) {
      projectButton.classList.add("is-active");
    }
    projectButton.textContent = project.getName();
    projectButton.addEventListener("click", () => {
      if (manager.getActiveProject() === project) return;
      manager.setActiveProject(project);
      save(manager);
      renderProjects(manager);
      renderTasks(manager.getActiveProject(), manager);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.classList.add("delete-btn", "project-delete-btn");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      const confirmed = window.confirm(
        `Delete project "${project.getName()}" and all its tasks?`
      );
      if (!confirmed) return;

      manager.removeProject(project);
      const nextActive = ensureProjectAfterRemoval(manager);

      save(manager);
      renderProjects(manager);
      renderTasks(nextActive, manager);
    });

    const actions = document.createElement("div");
    actions.classList.add("project-actions");
    actions.appendChild(projectButton);
    actions.appendChild(deleteBtn);

    row.appendChild(actions);
    fragment.appendChild(row);
  });

  list.appendChild(fragment);
  projectContainer.appendChild(list);
}

function renderTasks(project, manager) {
  mainContent.innerHTML = "";

  if (!project) {
    mainContent.textContent = "No project selected.";
    return;
  }

  const header = document.createElement("div");
  header.classList.add("task-panel-header");

  const title = document.createElement("h2");
  title.textContent = project.getName();
  header.appendChild(title);

  mainContent.appendChild(header);

  const tasks = project.getTasks();

  const list = document.createElement("div");
  list.classList.add("task-list");

  if (tasks.length === 0) {
    const empty = document.createElement("p");
    empty.classList.add("empty-tasks");
    empty.textContent = "No tasks yet. Add one!";
    list.appendChild(empty);
  }

    tasks.forEach((task) => {
        // Make the whole card clickable
        const card = document.createElement("button");
        card.classList.add("task-card");
        card.type = "button";

    // --- Top row: chevron + title + meta (always visible) ---
    const headerRow = document.createElement("div");
    headerRow.classList.add("task-header");

    // Chevron icon (▶ collapsed, ▼ expanded)
    const chevron = document.createElement("span");
    chevron.classList.add("task-chevron");
    chevron.textContent = "▶";

    const title = document.createElement("h3");
    title.textContent = task.getTitle();

        const meta = document.createElement("p");
        meta.classList.add("task-meta");
        meta.textContent = `${task.getDueDate() || "No due date"} • ${
          task.getPriority() || "no priority"
        }`;

        const deleteTaskBtn = document.createElement("button");
        deleteTaskBtn.type = "button";
        deleteTaskBtn.classList.add("delete-btn", "task-delete-btn");
        deleteTaskBtn.textContent = "Delete";
        deleteTaskBtn.addEventListener("click", (event) => {
            event.stopPropagation();
            const confirmed = window.confirm(
              `Delete task "${task.getTitle() || "Untitled"}"?`
            );
            if (!confirmed) return;
            project.removeTask(task);
            save(manager);
            renderTasks(project, manager);
        });

        headerRow.appendChild(chevron);
        headerRow.appendChild(title);
        headerRow.appendChild(meta);
        headerRow.appendChild(deleteTaskBtn);

    // --- Details section (hidden by default) ---
    const details = document.createElement("div");
    details.classList.add("task-details");
    details.style.display = "none";

    const desc = document.createElement("p");
    desc.textContent = task.getDescription() || "No description";

    const note = document.createElement("p");
    note.textContent = task.getNote() || "No notes";

    // Status + checkbox row
    const statusRow = document.createElement("div");
    statusRow.classList.add("task-status-row");

    const checkbox = document.createElement("input");
    checkbox.classList.add("task-checkbox");
    checkbox.type = "checkbox";
    checkbox.checked = task.isChecked();

    const statusLabel = document.createElement("span");
    const updateStatusText = () => {
      statusLabel.textContent = checkbox.checked
        ? "✅ Completed"
        : "⬜ Not completed";
    };
    updateStatusText();

    // Prevent clicking the checkbox from toggling the card open/closed
    checkbox.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    checkbox.addEventListener("change", () => {
        task.setCheck(checkbox.checked);
        updateStatusText();
        save(manager);

        // Optional: visually style completed tasks
        if (checkbox.checked) {
            card.classList.add("task-completed");
        } else {
            card.classList.remove("task-completed");
        }
    });


    statusRow.appendChild(checkbox);
    statusRow.appendChild(statusLabel);

    details.appendChild(desc);
    details.appendChild(note);
    details.appendChild(statusRow);

    // --- Click card to toggle details + chevron state ---
    headerRow.addEventListener("click", () => {
        const isHidden = details.style.display === "none";
        details.style.display = isHidden ? "block" : "none";
        chevron.textContent = isHidden ? "▼" : "▶";
    });

    // --- Build card ---
    card.appendChild(headerRow);
    card.appendChild(details);

    list.appendChild(card);
  });

  mainContent.appendChild(list);

  const taskControls = buildTaskControls(project, manager);
  mainContent.appendChild(taskControls);
}

function buildProjectControls(manager) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("project-controls");

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.classList.add("add-project-btn");
  toggleBtn.textContent = "Add project";

  const form = document.createElement("form");
  form.classList.add("project-form", "is-hidden");

  const nameLabel = document.createElement("label");
  nameLabel.textContent = "Project name";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.required = true;
  nameInput.placeholder = "e.g. Today";
  nameLabel.appendChild(nameInput);

  const errorMsg = document.createElement("p");
  errorMsg.classList.add("form-feedback");
  errorMsg.setAttribute("aria-live", "polite");
  form.appendChild(nameLabel);
  form.appendChild(errorMsg);

  const buttonRow = document.createElement("div");
  buttonRow.classList.add("form-actions");

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Create";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.textContent = "Cancel";

  buttonRow.appendChild(submitBtn);
  buttonRow.appendChild(cancelBtn);
  form.appendChild(buttonRow);

  const { hide } = attachFormToggle({ form, toggleBtn, focusEl: nameInput });

  cancelBtn.addEventListener("click", hide);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const projectName = nameInput.value.trim();
    if (!projectName) {
      errorMsg.textContent = "Please enter a project name.";
      nameInput.focus();
      return;
    }

    if (manager.getProjectByName(projectName)) {
      errorMsg.textContent = "A project with that name already exists.";
      nameInput.focus();
      return;
    }

    const newProject = makeProject(projectName);
    manager.addProject(newProject);
    manager.setActiveProject(newProject);

    save(manager);
    errorMsg.textContent = "";
    hide();
    renderProjects(manager);
    renderTasks(newProject, manager);
  });

  wrapper.appendChild(toggleBtn);
  wrapper.appendChild(form);

  return wrapper;
}

function buildTaskControls(project, manager) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("task-controls");

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.classList.add("add-task-btn");
  toggleBtn.textContent = "Add task";

  const form = document.createElement("form");
  form.classList.add("task-form", "is-hidden");

  const titleLabel = document.createElement("label");
  titleLabel.textContent = "Title";
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.required = true;
  titleInput.placeholder = "Task title";
  titleLabel.appendChild(titleInput);

  const descLabel = document.createElement("label");
  descLabel.textContent = "Description";
  const descInput = document.createElement("textarea");
  descInput.placeholder = "Optional description";
  descLabel.appendChild(descInput);

  const dateLabel = document.createElement("label");
  dateLabel.textContent = "Due date";
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateLabel.appendChild(dateInput);

  const priorityLabel = document.createElement("label");
  priorityLabel.textContent = "Priority";
  const prioritySelect = document.createElement("select");
  ["", "low", "medium", "high"].forEach((level) => {
    const option = document.createElement("option");
    option.value = level;
    option.textContent = level ? level[0].toUpperCase() + level.slice(1) : "None";
    prioritySelect.appendChild(option);
  });
  priorityLabel.appendChild(prioritySelect);

  const noteLabel = document.createElement("label");
  noteLabel.textContent = "Note";
  const noteInput = document.createElement("textarea");
  noteInput.placeholder = "Optional note";
  noteLabel.appendChild(noteInput);

  const buttonRow = document.createElement("div");
  buttonRow.classList.add("form-actions");

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Create task";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.textContent = "Cancel";

  buttonRow.appendChild(submitBtn);
  buttonRow.appendChild(cancelBtn);

  form.appendChild(titleLabel);
  form.appendChild(descLabel);
  form.appendChild(dateLabel);
  form.appendChild(priorityLabel);
  form.appendChild(noteLabel);
  form.appendChild(buttonRow);

  const { hide } = attachFormToggle({ form, toggleBtn, focusEl: titleInput });

  cancelBtn.addEventListener("click", hide);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const newTask = makeTask({
      title: titleInput.value,
      description: descInput.value,
      dueDate: dateInput.value,
      priority: prioritySelect.value,
      note: noteInput.value,
    });

    // Ignore incomplete titles
    if (!newTask.getTitle()) {
      titleInput.focus();
      return;
    }

    project.addTask(newTask);
    save(manager);
    hide();
    renderTasks(project, manager);
  });

  wrapper.appendChild(toggleBtn);
  wrapper.appendChild(form);

  return wrapper;
}

function attachFormToggle({ form, toggleBtn, focusEl }) {
  const hide = () => {
    form.classList.add("is-hidden");
    form.reset();
  };

  const show = () => {
    form.classList.remove("is-hidden");
    if (focusEl) {
      focusEl.focus();
    }
  };

  toggleBtn.addEventListener("click", () => {
    if (form.classList.contains("is-hidden")) {
      show();
    } else {
      hide();
    }
  });

  return { hide, show };
}

function ensureProjectAfterRemoval(manager) {
  if (manager.getProjects().length === 0) {
    const fallback = makeProject(generateDefaultProjectName(manager));
    manager.addProject(fallback);
    manager.setActiveProject(fallback);
    return fallback;
  }

  const active = manager.getActiveProject();
  if (active && manager.getProjects().includes(active)) {
    return active;
  }

  const [first] = manager.getProjects();
  if (first) {
    manager.setActiveProject(first);
    return first;
  }

  return null;
}

function generateDefaultProjectName(manager) {
  const base = "Today";
  let candidate = base;
  let suffix = 2;

  while (manager.getProjectByName(candidate)) {
    candidate = `${base} (${suffix})`;
    suffix += 1;
  }

  return candidate;
}
