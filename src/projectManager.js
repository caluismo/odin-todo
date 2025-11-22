const hasProjects = (state) => ({
    addProject(project) {
        state.projects.push(project);
    },

    removeProject(project) {
        const index = state.projects.indexOf(project);
        if (index !== -1) {
            state.projects.splice(index, 1);
        }
    },

    clearProjects() {
        state.projects.length = 0;
    }, 

    getProjects() {
        return [...state.projects];
    },

    getProjectByName(name) {
        return state.projects.find(
            (project) => project.getName() === name);
    }

});

export default function makeProjectManager(projects = []) {
    const state = {projects : [...projects]}

    return{...hasProjects(state)};
}