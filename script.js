const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const dayTitle = document.getElementById('day-title');
const taskContainer = document.getElementById('task-container');
const daySelect = document.getElementById('day-select');
const taskInput = document.getElementById('task-input');
const saveTaskBtn = document.getElementById('save-task');

let tasks = JSON.parse(localStorage.getItem('weeklyTasks')) || {
    0: [],1: [],2: [],3: [],4: [],5: [],6: []
};

function renderTasks(dayIndex) {
    dayTitle.textContent = `Tarefas de ${days[dayIndex]}`;
    taskContainer.innerHTML = '';

    tasks[dayIndex].forEach((task, index) => {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.textContent = task.name;
        if(task.completed) card.classList.add('completed');
        card.draggable = true;

        // Toggle completed on click
        card.addEventListener('click', () => {
            task.completed = !task.completed;
            localStorage.setItem('weeklyTasks', JSON.stringify(tasks));
            renderTasks(dayIndex);
        });

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.textContent = 'X';
        delBtn.onclick = (e) => {
            e.stopPropagation();
            tasks[dayIndex].splice(index, 1);
            localStorage.setItem('weeklyTasks', JSON.stringify(tasks));
            renderTasks(dayIndex);
        };
        card.appendChild(delBtn);

        // Drag events
        card.addEventListener('dragstart', () => card.classList.add('dragging'));
        card.addEventListener('dragend', () => card.classList.remove('dragging'));

        taskContainer.appendChild(card);
    });
}

// Drag-and-drop to reorder
taskContainer.addEventListener('dragover', e => {
    e.preventDefault();
    const draggingCard = document.querySelector('.dragging');
    const afterElement = getDragAfterElement(taskContainer, e.clientY);
    if(afterElement == null) {
        taskContainer.appendChild(draggingCard);
    } else {
        taskContainer.insertBefore(draggingCard, afterElement);
    }
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if(offset < 0 && offset > closest.offset) return {offset: offset, element: child};
        else return closest;
    }, {offset: Number.NEGATIVE_INFINITY}).element;
}

const today = new Date().getDay();
daySelect.value = today;
renderTasks(today);

saveTaskBtn.addEventListener('click', () => {
    const dayIndex = parseInt(daySelect.value);
    const taskName = taskInput.value.trim();
    if(taskName) {
        tasks[dayIndex].push({name: taskName, completed: false});
        localStorage.setItem('weeklyTasks', JSON.stringify(tasks));
        taskInput.value = '';
        if(dayIndex === today) renderTasks(today);
    }
});
