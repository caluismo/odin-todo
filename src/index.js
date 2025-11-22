import "./style.css";

import makeProjectManager from "./projectManager.js";
import makeProject from "./project.js";
import makeTask from "./tasks.js";

const manager = makeProjectManager();
const defaultProject = makeProject("Today"); 
manager.addProject(defaultProject);
manager.setActiveProject(defaultProject);

defaultProject.addTask(
  makeTask({ title: "Test task 1", description: "Demo", priority: "high" })
);

defaultProject.addTask(
  makeTask({ title: "Test task 2", description: "Another Demo", priority: "low" })
);


document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM ready. Your data layer is working:");
    console.log("Projects:", manager.getProjects());
    console.log("Active project:", manager.getActiveProjectName());
    console.log("Active project tasks:", manager.getActiveProject().getTasks());
});