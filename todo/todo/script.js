// DOM Elements
const todoInput = document.getElementById('todoInput');
const dueDateInput = document.getElementById('dueDateInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const clearBtn = document.getElementById('clearBtn');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const subjectInput = document.getElementById('subjectInput');
const addSubjectBtn = document.getElementById('addSubjectBtn');
const subjectTabs = document.getElementById('subjectTabs');

// Initialize subjects from localStorage
let subjects = JSON.parse(localStorage.getItem('subjects')) || { 'General': [] };
let currentSubject = localStorage.getItem('currentSubject') || 'General';

// Ensure current subject exists
if (!subjects[currentSubject]) {
    currentSubject = Object.keys(subjects)[0] || 'General';
}

// Event Listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});
addSubjectBtn.addEventListener('click', addSubject);
subjectInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addSubject();
});
clearBtn.addEventListener('click', clearCompleted);

// Add new subject
function addSubject() {
    const name = subjectInput.value.trim();
    
    if (name === '') {
        alert('Please enter a subject name!');
        return;
    }

    if (subjects[name]) {
        alert('Subject already exists!');
        return;
    }

    subjects[name] = [];
    currentSubject = name;
    saveData();
    renderSubjectTabs();
    renderTodos();
    subjectInput.value = '';
    subjectInput.focus();
}

// Delete subject
function deleteSubject(name) {
    if (Object.keys(subjects).length === 1) {
        alert('You must have at least one subject!');
        return;
    }

    if (confirm(`Delete "${name}" and all its tasks?`)) {
        delete subjects[name];
        currentSubject = Object.keys(subjects)[0];
        saveData();
        renderSubjectTabs();
        renderTodos();
    }
}

// Switch to subject
function switchSubject(name) {
    currentSubject = name;
    saveData();
    renderSubjectTabs();
    renderTodos();
}

// Add new todo to current subject
function addTodo() {
    const text = todoInput.value.trim();
    const dueDate = dueDateInput.value;
    
    if (text === '') {
        alert('Please enter a task!');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        dueDate: dueDate,
        completed: false
    };

    subjects[currentSubject].push(todo);
    saveData();
    renderTodos();
    todoInput.value = '';
    dueDateInput.value = '';
    todoInput.focus();
}

// Delete todo
function deleteTodo(id) {
    subjects[currentSubject] = subjects[currentSubject].filter(todo => todo.id !== id);
    saveData();
    renderTodos();
}

// Toggle todo completion
function toggleTodo(id) {
    const todo = subjects[currentSubject].find(todo => todo.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        if (todo.completed) {
            showNotification(`✅ Great job! "${todo.text}" completed!`);
        }
        saveData();
        renderTodos();
    }
}

// Clear all completed todos
function clearCompleted() {
    subjects[currentSubject] = subjects[currentSubject].filter(todo => !todo.completed);
    saveData();
    renderTodos();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('subjects', JSON.stringify(subjects));
    localStorage.setItem('currentSubject', currentSubject);
}

// Render subject tabs
function renderSubjectTabs() {
    subjectTabs.innerHTML = '';

    Object.keys(subjects).forEach(subject => {
        const tab = document.createElement('button');
        tab.className = `subject-tab ${subject === currentSubject ? 'active' : ''}`;
        tab.innerHTML = `
            <span class="tab-name">${escapeHtml(subject)}</span>
            ${Object.keys(subjects).length > 1 ? `<button class="delete-subject-btn" onclick="deleteSubject('${subject.replace(/'/g, "\\'")}')">✕</button>` : ''}
        `;
        tab.onclick = (e) => {
            if (!e.target.classList.contains('delete-subject-btn')) {
                switchSubject(subject);
            }
        };
        subjectTabs.appendChild(tab);
    });
}

// Render todos to the DOM
function renderTodos() {
    todoList.innerHTML = '';
    const todos = subjects[currentSubject] || [];

    if (todos.length === 0) {
        emptyState.style.display = 'block';
        clearBtn.disabled = true;
        totalCount.textContent = '0';
        completedCount.textContent = '0';
        return;
    }

    emptyState.style.display = 'none';

    todos.forEach(todo => {
        const li = document.createElement('li');
        const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date().setHours(0, 0, 0, 0);
        li.className = `todo-item ${todo.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`;
        
        const dueStr = todo.dueDate ? ` - Due: ${new Date(todo.dueDate).toLocaleDateString()}` : '';
        
        li.innerHTML = `
            <input 
                type="checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id})"
            >
            <div class="todo-content">
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                ${dueStr ? `<span class="todo-due-date">${dueStr}</span>` : ''}
            </div>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
        `;
        
        todoList.appendChild(li);
    });

    // Update stats
    const completed = todos.filter(todo => todo.completed).length;
    totalCount.textContent = todos.length;
    completedCount.textContent = completed;
    clearBtn.disabled = completed === 0;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show success notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Initial render
renderSubjectTabs();
renderTodos();
