const hasTask = (state) => ({
    addTask(task) {
        state.tasks.push(task);
    },

    removeTask(task) {
        const index = state.tasks.indexOf(task);
        if (index !== -1) {
            state.tasks.splice(index, 1);
        }
    },

    getTasks() {
        return [...state.tasks];
    }

});

const hasName = (state) => ({
    getName() {
        return state.name;
    },
    setName(newName) {
        if (typeof newName === "string" && newName.trim()) {
            state.name = newName.trim();
        }
    }
});


export default function makeProject(name, tasks = []) {
    const state = {
        name, 
        tasks: [...tasks]
    };

    return {
        ...hasTask(state), 
        ...hasName(state)
    };
};