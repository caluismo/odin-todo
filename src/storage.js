import makeProjectManager from "./projectManager.js";
import makeProject from "./project.js";
import makeTask from "./tasks.js";

const STORAGE_KEY = "planner-data";

export function save(manager) {
  const data = {
    projects: manager.getProjects().map((project) => ({
      name: project.getName(),
      tasks: project.getTasks().map((task) => task.getState())
    })),
    activeProjectName: manager.getActiveProjectName()
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;  // nothing stored yet

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("localStorage corrupted:", e);
    return null;
  }
}

export function restoreManager(data) {
  const manager = makeProjectManager();

  data.projects.forEach((projData) => {
    const project = makeProject(projData.name);

    projData.tasks.forEach((taskData) => {
      const task = makeTask(taskData);
      project.addTask(task);
    });

    manager.addProject(project);
  });

  if (data.activeProjectName) {
    manager.setActiveProjectByName(data.activeProjectName);
  }

  return manager;
}

