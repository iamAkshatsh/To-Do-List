// ============================
// TO-DO LIST APPLICATION
// ============================

// Global Variables and State Management
let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;

// DOM Elements - Getting references to all elements we'll need
const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDateInput');
const prioritySelect = document.getElementById('prioritySelect');
const addTaskBtn = document.getElementById('addTaskBtn');
const tasksList = document.getElementById('tasksList');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const editModal = document.getElementById('editModal');
const editTaskInput = document.getElementById('editTaskInput');
const editDueDateInput = document.getElementById('editDueDateInput');
const editPrioritySelect = document.getElementById('editPrioritySelect');
const closeModalBtn = document.getElementById('closeModal');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveEditBtn = document.getElementById('saveEditBtn');

// Counter elements
const allCount = document.getElementById('allCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');

// ============================
// INITIALIZATION
// ============================

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadTasksFromStorage(); // Load saved tasks from localStorage
    renderTasks(); // Display tasks on the page
    updateCounters(); // Update task counters
    setupEventListeners(); // Set up all event listeners
    
    console.log('To-Do App initialized successfully!');
});

// ============================
// EVENT LISTENERS SETUP
// ============================

function setupEventListeners() {
    // Add task button click
    addTaskBtn.addEventListener('click', addTask);
    
    // Enter key press in task input
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    // Filter button clicks
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            setActiveFilter(filter);
        });
    });
    
    // Clear completed button
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    
    // Modal controls
    closeModalBtn.addEventListener('click', closeEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);
    saveEditBtn.addEventListener('click', saveTaskEdit);
    
    // Close modal when clicking outside
    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
    
    // Enter key in edit modal
    editTaskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveTaskEdit();
        }
    });
}

// ============================
// TASK MANAGEMENT FUNCTIONS
// ============================

// Add a new task
function addTask() {
    const taskText = taskInput.value.trim();
    
    // Validation: Check if task text is not empty
    if (!taskText) {
        showNotification('Please enter a task description!', 'error');
        taskInput.focus();
        return;
    }
    
    // Create new task object
    const newTask = {
        id: generateUniqueId(), // Generate unique ID
        text: taskText,
        completed: false,
        priority: prioritySelect.value,
        dueDate: dueDateInput.value || null,
        createdAt: new Date().toISOString()
    };
    
    // Add task to the beginning of the array (newest first)
    tasks.unshift(newTask);
    
    // Clear input fields
    clearInputs();
    
    // Update UI
    saveTasksToStorage();
    renderTasks();
    updateCounters();
    
    showNotification('Task added successfully!', 'success');
    
    console.log('New task added:', newTask);
}

// Toggle task completion status
function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        
        saveTasksToStorage();
        renderTasks();
        updateCounters();
        
        const status = task.completed ? 'completed' : 'activated';
        showNotification(`Task ${status}!`, 'success');
        
        console.log(`Task ${taskId} toggled to ${task.completed ? 'completed' : 'active'}`);
    }
}

// Delete a task
function deleteTask(taskId) {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    // Remove task from array
    tasks = tasks.filter(t => t.id !== taskId);
    
    // Update UI
    saveTasksToStorage();
    renderTasks();
    updateCounters();
    
    showNotification('Task deleted successfully!', 'success');
    
    console.log(`Task ${taskId} deleted`);
}

// Open edit modal for a task
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Set current editing task
    editingTaskId = taskId;
    
    // Populate modal with current task data
    editTaskInput.value = task.text;
    editDueDateInput.value = task.dueDate || '';
    editPrioritySelect.value = task.priority;
    
    // Show modal
    editModal.classList.add('active');
    editTaskInput.focus();
    
    console.log(`Editing task ${taskId}`);
}

// Save task edit
function saveTaskEdit() {
    const newText = editTaskInput.value.trim();
    
    // Validation
    if (!newText) {
        showNotification('Please enter a task description!', 'error');
        editTaskInput.focus();
        return;
    }
    
    // Find and update task
    const task = tasks.find(t => t.id === editingTaskId);
    if (task) {
        task.text = newText;
        task.dueDate = editDueDateInput.value || null;
        task.priority = editPrioritySelect.value;
        task.updatedAt = new Date().toISOString();
        
        // Update UI
        saveTasksToStorage();
        renderTasks();
        updateCounters();
        
        showNotification('Task updated successfully!', 'success');
        
        console.log(`Task ${editingTaskId} updated`);
    }
    
    closeEditModal();
}

// Close edit modal
function closeEditModal() {
    editModal.classList.remove('active');
    editingTaskId = null;
    
    // Clear modal inputs
    editTaskInput.value = '';
    editDueDateInput.value = '';
    editPrioritySelect.value = 'medium';
}

// Clear all completed tasks
function clearCompletedTasks() {
    const completedCount = tasks.filter(t => t.completed).length;
    
    if (completedCount === 0) {
        showNotification('No completed tasks to clear!', 'info');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
        return;
    }
    
    // Remove completed tasks
    tasks = tasks.filter(t => !t.completed);
    
    // Update UI
    saveTasksToStorage();
    renderTasks();
    updateCounters();
    
    showNotification(`${completedCount} completed task(s) cleared!`, 'success');
    
    console.log(`${completedCount} completed tasks cleared`);
}

// ============================
// FILTERING AND DISPLAY
// ============================

// Set active filter and update display
function setActiveFilter(filter) {
    currentFilter = filter;
    
    // Update active filter button
    filterBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        }
    });
    
    // Re-render tasks with new filter
    renderTasks();
    
    console.log(`Filter changed to: ${filter}`);
}

// Get filtered tasks based on current filter
function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(t => !t.completed);
        case 'completed':
            return tasks.filter(t => t.completed);
        case 'all':
        default:
            return tasks;
    }
}

// ============================
// RENDERING FUNCTIONS
// ============================

// Render all tasks to the DOM
function renderTasks() {
    const filteredTasks = getFilteredTasks();
    
    // Clear current tasks display
    tasksList.innerHTML = '';
    
    // Show/hide empty state
    if (filteredTasks.length === 0) {
        emptyState.style.display = 'block';
        updateEmptyStateMessage();
    } else {
        emptyState.style.display = 'none';
        
        // Render each task
        filteredTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            tasksList.appendChild(taskElement);
        });
    }
    
    console.log(`Rendered ${filteredTasks.length} tasks with filter: ${currentFilter}`);
}

// Create HTML element for a single task
function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
    taskDiv.setAttribute('data-task-id', task.id);
    
    // Format due date
    let dueDateHtml = '';
    if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const isOverdue = dueDate < today && !task.completed;
        
        dueDateHtml = `
            <span class="task-due-date ${isOverdue ? 'overdue' : ''}">
                📅 ${formatDate(task.dueDate)}
            </span>
        `;
    }
    
    // Create task HTML
    taskDiv.innerHTML = `
        <div class="task-content">
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                 onclick="toggleTask('${task.id}')">
            </div>
            <div class="task-details">
                <div class="task-text ${task.completed ? 'completed' : ''}">${escapeHtml(task.text)}</div>
                <div class="task-meta">
                    ${dueDateHtml}
                    <span class="task-priority priority-${task.priority}">
                        ${getPriorityIcon(task.priority)} ${task.priority}
                    </span>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn edit-btn" onclick="editTask('${task.id}')" title="Edit task">
                    ✏️
                </button>
                <button class="action-btn delete-btn" onclick="deleteTask('${task.id}')" title="Delete task">
                    🗑️
                </button>
            </div>
        </div>
    `;
    
    return taskDiv;
}

// Update empty state message based on current filter
function updateEmptyStateMessage() {
    const emptyIcon = emptyState.querySelector('.empty-icon');
    const emptyTitle = emptyState.querySelector('h3');
    const emptyText = emptyState.querySelector('p');
    
    switch (currentFilter) {
        case 'active':
            emptyIcon.textContent = '🎉';
            emptyTitle.textContent = 'No active tasks!';
            emptyText.textContent = 'Great job! You\'ve completed all your tasks.';
            break;
        case 'completed':
            emptyIcon.textContent = '📝';
            emptyTitle.textContent = 'No completed tasks';
            emptyText.textContent = 'Complete some tasks to see them here.';
            break;
        case 'all':
        default:
            emptyIcon.textContent = '📝';
            emptyTitle.textContent = 'No tasks yet';
            emptyText.textContent = 'Add a task above to get started!';
            break;
    }
}

// Update task counters
function updateCounters() {
    const all = tasks.length;
    const active = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;
    
    allCount.textContent = all;
    activeCount.textContent = active;
    completedCount.textContent = completed;
    
    // Hide clear button if no completed tasks
    clearCompletedBtn.style.display = completed > 0 ? 'block' : 'none';
}

// ============================
// UTILITY FUNCTIONS
// ============================

// Generate unique ID for tasks
function generateUniqueId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Clear input fields
function clearInputs() {
    taskInput.value = '';
    dueDateInput.value = '';
    prioritySelect.value = 'medium';
    taskInput.focus();
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if it's today or tomorrow
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        // Return formatted date
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
    }
}

// Get priority icon
function getPriorityIcon(priority) {
    switch (priority) {
        case 'high': return '🔴';
        case 'medium': return '🟡';
        case 'low': return '🟢';
        default: return '🟡';
    }
}

// Escape HTML to prevent XSS attacks
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show notification to user
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '9999',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease',
        maxWidth: '300px',
        wordWrap: 'break-word'
    });
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.background = '#4caf50';
            break;
        case 'error':
            notification.style.background = '#f44336';
            break;
        case 'info':
        default:
            notification.style.background = '#2196f3';
            break;
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ============================
// LOCAL STORAGE FUNCTIONS
// ============================

// Save tasks to localStorage
function saveTasksToStorage() {
    try {
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
        console.log('Tasks saved to localStorage');
    } catch (error) {
        console.error('Error saving tasks to localStorage:', error);
        showNotification('Error saving tasks!', 'error');
    }
}

// Load tasks from localStorage
function loadTasksFromStorage() {
    try {
        const savedTasks = localStorage.getItem('todoTasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            console.log(`Loaded ${tasks.length} tasks from localStorage`);
        } else {
            // Initialize with sample tasks for demo
            tasks = [
                {
                    id: generateUniqueId(),
                    text: 'Welcome to your To-Do List!',
                    completed: false,
                    priority: 'medium',
                    dueDate: null,
                    createdAt: new Date().toISOString()
                },
                {
                    id: generateUniqueId(),
                    text: 'Try editing this task by clicking the edit button',
                    completed: false,
                    priority: 'low',
                    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
                    createdAt: new Date().toISOString()
                },
                {
                    id: generateUniqueId(),
                    text: 'Mark this task as complete by clicking the checkbox',
                    completed: true,
                    priority: 'high',
                    dueDate: null,
                    createdAt: new Date().toISOString()
                }
            ];
            saveTasksToStorage();
            console.log('Initialized with sample tasks');
        }
    } catch (error) {
        console.error('Error loading tasks from localStorage:', error);
        tasks = [];
        showNotification('Error loading saved tasks!', 'error');
    }
}

// ============================
// KEYBOARD SHORTCUTS
// ============================

// Add keyboard shortcuts for better UX
document.addEventListener('keydown', function(e) {
    // Escape key closes modal
    if (e.key === 'Escape' && editModal.classList.contains('active')) {
        closeEditModal();
    }
    
    // Ctrl/Cmd + Enter to add task quickly
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !editModal.classList.contains('active')) {
        addTask();
    }
});

// ============================
// ADDITIONAL FEATURES
// ============================

// Sort tasks by different criteria
function sortTasks(criteria) {
    switch (criteria) {
        case 'date':
            tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            break;
        case 'dueDate':
            tasks.sort((a, b) => {
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
            break;
        case 'alphabetical':
            tasks.sort((a, b) => a.text.localeCompare(b.text));
            break;
    }
    
    saveTasksToStorage();
    renderTasks();
    showNotification(`Tasks sorted by ${criteria}!`, 'info');
}

// Export tasks to JSON
function exportTasks() {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `todo-tasks-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Tasks exported successfully!', 'success');
}

// Import tasks from JSON file
function importTasks(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedTasks = JSON.parse(e.target.result);
            if (Array.isArray(importedTasks)) {
                // Merge with existing tasks or replace
                const shouldMerge = confirm('Merge with existing tasks? (Cancel to replace all tasks)');
                
                if (shouldMerge) {
                    tasks = [...tasks, ...importedTasks];
                } else {
                    tasks = importedTasks;
                }
                
                saveTasksToStorage();
                renderTasks();
                updateCounters();
                showNotification(`${importedTasks.length} tasks imported successfully!`, 'success');
            } else {
                throw new Error('Invalid file format');
            }
        } catch (error) {
            console.error('Import error:', error);
            showNotification('Error importing tasks! Please check file format.', 'error');
        }
    };
    reader.readAsText(file);
}

// ============================
// PERFORMANCE OPTIMIZATION
// ============================

// Debounce function to limit rapid function calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================
// ACCESSIBILITY IMPROVEMENTS
// ============================

// Add ARIA labels and keyboard navigation
function improveAccessibility() {
    // Add ARIA labels to interactive elements
    const elements = {
        taskInput: 'Enter new task description',
        dueDateInput: 'Select due date for task',
        prioritySelect: 'Select task priority level',
        addTaskBtn: 'Add new task to list'
    };
    
    Object.entries(elements).forEach(([id, label]) => {
        const element = document.getElementById(id);
        if (element) {
            element.setAttribute('aria-label', label);
        }
    });
    
    // Add keyboard navigation for filter buttons
    filterBtns.forEach((btn, index) => {
        btn.setAttribute('tabindex', '0');
        btn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

// Initialize accessibility improvements
document.addEventListener('DOMContentLoaded', improveAccessibility);

// ============================
// ERROR HANDLING
// ============================

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showNotification('An unexpected error occurred!', 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('An error occurred while processing your request!', 'error');
});

// ============================
// APPLICATION STATISTICS
// ============================

// Get application statistics
function getAppStats() {
    const stats = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length,
        activeTasks: tasks.filter(t => !t.completed).length,
        overdueTasks: tasks.filter(t => {
            if (!t.dueDate || t.completed) return false;
            return new Date(t.dueDate) < new Date();
        }).length,
        tasksByPriority: {
            high: tasks.filter(t => t.priority === 'high').length,
            medium: tasks.filter(t => t.priority === 'medium').length,
            low: tasks.filter(t => t.priority === 'low').length
        },
        completionRate: tasks.length > 0 ? 
            Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0
    };
    
    console.log('App Statistics:', stats);
    return stats;
}

// Console command to view stats (for developers)
console.log('%cTo-Do List App', 'font-size: 20px; color: #667eea; font-weight: bold;');
console.log('Type getAppStats() to view application statistics');
console.log('Type exportTasks() to download your tasks');

// ============================
// END OF APPLICATION
// ============================

console.log('✅ To-Do List Application loaded successfully!');
console.log('📝 Features: Add, Edit, Delete, Filter, Priority, Due Dates, Local Storage');
console.log('🎨 Responsive design with modern UI/UX');