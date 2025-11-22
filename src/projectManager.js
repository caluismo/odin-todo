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

const hasActiveProject = (state) => ({
    setActiveProject(project) {
        const exists = state.projects.includes(project);
        if (exists) {state.activeProject = project};
    },

    setActiveProjectByName(name) {
        const found = state.projects.find(
            (project) => project.getName && project.getName() === name
        );
        if (found) {
            state.activeProject = found;
        }
    },

    getActiveProject() {
        return state.activeProject;
    }, 

    getActiveProjectName() {
        return state.activeProject?.getName 
            ? state.activeProject.getName()
            : null ;
    }

});


export default function makeProjectManager(initialProjects = []) {
    const state = {
        projects : [...initialProjects],
        activeProject: initialProjects[0] ?? null
    };

    return {
        ...hasProjects(state), 
        ...hasActiveProject(state)
    };
}