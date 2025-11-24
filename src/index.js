import "./style.css";

import makeProjectManager from "./projectManager.js";
import makeProject from "./project.js";
import makeTask from "./tasks.js";
import {initUI} from "./dom.js";
import { save, load, restoreManager } from "./storage.js";


// Try to load existing data
let manager;

const saved = load();

if (saved) {
  manager = restoreManager(saved);
} else {
  manager = makeProjectManager();
}

ensureDefaultProject(manager);

function ensureDefaultProject(managerInstance) {
  if (managerInstance.getProjects().length === 0) {
    const defaultProject = makeProject("Today");
    managerInstance.addProject(defaultProject);
    managerInstance.setActiveProject(defaultProject);
    return;
  }

  if (!managerInstance.getActiveProject()) {
    const firstProject = managerInstance.getProjects()[0];
    if (firstProject) {
      managerInstance.setActiveProject(firstProject);
    }
  }
}


document.addEventListener("DOMContentLoaded", () => {
    initUI(manager);


    console.log("DOM ready. Your data layer is working:");
    console.log("Projects:", manager.getProjects());
    console.log("Active project:", manager.getActiveProjectName());
    console.log("Active project tasks:", manager.getActiveProject().getTasks());
});
