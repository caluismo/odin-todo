import "./style.css";
import makeProjectManager from "./projectManager.js";
import makeProject from "./project.js";
import makeTask from "./tasks.js";


const manage = makeProjectManager();
const proj = makeProject("Today", ["me", "hi"]); 
const proj2 = makeProject("Tod", ["meeee", "hiiiii", "uhuhu"]); 
console.log(proj.getName());
console.log(proj.getTasks());
manage.addProject(proj);
manage.addProject(proj2);
console.log(manage.getProjects());