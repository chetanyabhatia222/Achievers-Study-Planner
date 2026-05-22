// ==========================================
// DEFAULT DATA
// ==========================================

var DEFAULT_SUBJECTS = [
    { id: 'ai',     name: 'Artificial Intelligence', color: '#9b59b6' },
    { id: 'python', name: 'Python Programming',      color: '#3498db' },
    { id: 'dm',     name: 'Disaster Management',     color: '#e67e22' },
    { id: 'math',   name: 'Discrete Mathematics',    color: '#2ecc71' }
];

var DEFAULT_TASKS = [
    { id: 't1', subject: 'ai',     name: 'Basics of Soft Computing',             date: '--', priority: 'priority-high',   completed: false },
    { id: 't2', subject: 'ai',     name: 'Techniques of Soft Computing',         date: '--', priority: 'priority-high',   completed: false },
    { id: 't3', subject: 'python', name: 'Basics of Python Programming',         date: '--', priority: 'priority-high',   completed: false },
    { id: 't4', subject: 'python', name: 'Functions on Python Programming',      date: '--', priority: 'priority-medium', completed: false },
    { id: 't5', subject: 'python', name: 'OOPS Concept',                         date: '--', priority: 'priority-high',   completed: false },
    { id: 't6', subject: 'dm',     name: 'Introduction to Disaster Management',  date: '--', priority: 'priority-high',   completed: false },
    { id: 't7', subject: 'dm',     name: 'Man Made Disasters vs Natural Disasters', date: '--', priority: 'priority-medium', completed: false },
    { id: 't8', subject: 'math',   name: 'Sets',                                 date: '--', priority: 'priority-high',   completed: false },
    { id: 't9', subject: 'math',   name: 'Relation and Functions',               date: '--', priority: 'priority-medium', completed: false }
];

// ==========================================
// LOCALSTORAGE HELPERS
// ==========================================

function loadSubjects() {
    var raw = localStorage.getItem('achievers_subjects');
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_SUBJECTS));
}

function saveSubjects(subjects) {
    localStorage.setItem('achievers_subjects', JSON.stringify(subjects));
}

function loadTasks() {
    var raw = localStorage.getItem('achievers_tasks');
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_TASKS));
}

function saveTasks(tasks) {
    localStorage.setItem('achievers_tasks', JSON.stringify(tasks));
}

function generateId() {
    return 'id_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

// ==========================================
// BUILD DOM FROM DATA
// ==========================================

function buildSubjectList(subjects) {
    var ul = document.getElementById('subject-list');
    ul.innerHTML = '';
    subjects.forEach(function (sub, idx) {
        var li = document.createElement('li');
        li.innerHTML =
            '<a href="#" class="subject-link' + (idx === 0 ? ' active' : '') + '" data-subject="' + sub.id + '">' +
                '<span class="dot" style="background-color:' + sub.color + ';"></span>' +
                sub.name +
            '</a>' +
            '<button class="subject-delete-btn" data-subject="' + sub.id + '" title="Delete subject">&#10005;</button>';
        ul.appendChild(li);
    });
}

function buildTaskCards(tasks, subjects) {
    var container = document.getElementById('task-container');
    container.innerHTML = '';
    var activeSubject = getActiveSubject();
    tasks.forEach(function (task) {
        var card = createTaskCard(task, activeSubject);
        container.appendChild(card);
    });
}

function createTaskCard(task, activeSubject) {
    var card = document.createElement('div');
    card.className = 'task-card ' + task.priority + (task.subject !== activeSubject ? ' hidden' : '') + (task.completed ? ' completed' : '');
    card.setAttribute('data-subject', task.subject);
    card.setAttribute('data-task-id', task.id);

    card.innerHTML =
        '<div class="task-info">' +
            '<input type="checkbox"' + (task.completed ? ' checked' : '') + '>' +
            '<div class="text">' +
                '<strong>' + task.name + '</strong>' +
                '<p>Deadline: ' + task.date + '</p>' +
            '</div>' +
        '</div>' +
        '<div class="actions">' +
            '<button class="edit-link">Edit</button>' +
            '<button class="delete-link">Delete</button>' +
        '</div>';

    return card;
}

// ==========================================
// INIT
// ==========================================

var subjects = loadSubjects();
var tasks = loadTasks();

buildSubjectList(subjects);
buildTaskCards(tasks, subjects);
updateProgressBar();
saveStats();

// Set title to first subject
var firstSubjectLink = document.querySelector('.subject-link.active');
if (firstSubjectLink) {
    document.getElementById('current-subject-title').textContent = 'Active Tasks: ' + firstSubjectLink.textContent.trim();
}

// ==========================================
// HELPER: GET ACTIVE SUBJECT
// ==========================================

function getActiveSubject() {
    var link = document.querySelector('.subject-link.active');
    return link ? link.getAttribute('data-subject') : null;
}

// ==========================================
// SUBJECT FILTERING (delegated — works for dynamic items)
// ==========================================

document.getElementById('subject-list').addEventListener('click', function (e) {
    var link = e.target.closest('.subject-link');
    if (!link) return;
    e.preventDefault();

    document.querySelectorAll('.subject-link').forEach(function (l) { l.classList.remove('active'); });
    link.classList.add('active');

    var selectedSubject = link.getAttribute('data-subject');
    var subjectName = link.textContent.trim();
    document.getElementById('current-subject-title').textContent = 'Active Tasks: ' + subjectName;

    document.querySelectorAll('.task-card').forEach(function (card) {
        if (card.getAttribute('data-subject') === selectedSubject) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });

    updateProgressBar();
});

// ==========================================
// DELETE SUBJECT
// ==========================================

var pendingDeleteSubjectId = null;

document.getElementById('subject-list').addEventListener('click', function (e) {
    var btn = e.target.closest('.subject-delete-btn');
    if (!btn) return;
    e.stopPropagation();
    pendingDeleteSubjectId = btn.getAttribute('data-subject');
    openModal('confirm-delete-subject-modal');
});

document.getElementById('delete-subject-confirm-btn').addEventListener('click', function () {
    if (pendingDeleteSubjectId) {
        // Remove from data
        subjects = subjects.filter(function (s) { return s.id !== pendingDeleteSubjectId; });
        tasks = tasks.filter(function (t) { return t.subject !== pendingDeleteSubjectId; });

        saveSubjects(subjects);
        saveTasks(tasks);

        // Rebuild DOM
        buildSubjectList(subjects);
        buildTaskCards(tasks, getActiveSubject() || (subjects[0] ? subjects[0].id : ''));

        // Activate first subject if any
        var firstLink = document.querySelector('.subject-link');
        if (firstLink) {
            firstLink.classList.add('active');
            document.getElementById('current-subject-title').textContent = 'Active Tasks: ' + firstLink.textContent.trim();
            var subId = firstLink.getAttribute('data-subject');
            document.querySelectorAll('.task-card').forEach(function (card) {
                card.classList.toggle('hidden', card.getAttribute('data-subject') !== subId);
            });
        } else {
            document.getElementById('current-subject-title').textContent = 'No Subjects Yet';
        }

        updateProgressBar();
        saveStats();
        pendingDeleteSubjectId = null;
    }
    closeModal('confirm-delete-subject-modal');
});

// ==========================================
// ADD SUBJECT (custom modal)
// ==========================================

document.getElementById('add-subject-btn').addEventListener('click', function () {
    document.getElementById('subject-name-input').value = '';
    openModal('add-subject-modal');
    setTimeout(function () { document.getElementById('subject-name-input').focus(); }, 100);
});

document.getElementById('subject-confirm-btn').addEventListener('click', function () {
    var name = document.getElementById('subject-name-input').value.trim();
    if (name) {
        var subjectId = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        var colors = ['#e74c3c', '#8e44ad', '#16a085', '#d35400', '#2980b9', '#27ae60', '#c0392b', '#f39c12'];
        var color = colors[subjects.length % colors.length];

        var newSubject = { id: subjectId, name: name, color: color };
        subjects.push(newSubject);
        saveSubjects(subjects);
        buildSubjectList(subjects);

        // Re-attach active state to current or new
        var allLinks = document.querySelectorAll('.subject-link');
        allLinks.forEach(function(l) { l.classList.remove('active'); });
        var lastLink = document.querySelector('.subject-link[data-subject="' + subjectId + '"]');
        if (lastLink) {
            lastLink.classList.add('active');
            document.getElementById('current-subject-title').textContent = 'Active Tasks: ' + name;
            document.querySelectorAll('.task-card').forEach(function (card) {
                card.classList.add('hidden');
            });
        }

        updateProgressBar();
        saveStats();
    }
    closeModal('add-subject-modal');
});

document.getElementById('subject-name-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('subject-confirm-btn').click();
});

// ==========================================
// ADD TASK
// ==========================================

document.getElementById('add-task-btn').addEventListener('click', function () {
    var name = document.getElementById('task-name-input').value.trim();
    var date = document.getElementById('task-date-input').value;
    var priority = document.getElementById('task-priority-input').value;
    var activeLink = document.querySelector('.subject-link.active');
    var errorEl = document.getElementById('task-error');

    if (!name || !date) {
        errorEl.classList.remove('hidden');
        setTimeout(function () { errorEl.classList.add('hidden'); }, 3000);
        return;
    }

    if (!activeLink) {
        errorEl.textContent = 'Please add or select a subject first!';
        errorEl.classList.remove('hidden');
        setTimeout(function () { errorEl.classList.add('hidden'); errorEl.textContent = 'Please enter Task Name and select a Date!'; }, 3000);
        return;
    }

    errorEl.classList.add('hidden');
    var activeSubId = activeLink.getAttribute('data-subject');

    var priorityClass = priority.toLowerCase().includes('high') ? 'priority-high' :
        priority.toLowerCase().includes('medium') ? 'priority-medium' : 'priority-low';

    var newTask = {
        id: generateId(),
        subject: activeSubId,
        name: name,
        date: date,
        priority: priorityClass,
        completed: false
    };

    tasks.push(newTask);
    saveTasks(tasks);

    var card = createTaskCard(newTask, activeSubId);
    document.getElementById('task-container').appendChild(card);

    document.getElementById('task-name-input').value = '';
    document.getElementById('task-date-input').value = '';

    updateProgressBar();
    saveStats();
});

// ==========================================
// DELETE TASK (custom confirm modal)
// ==========================================

var pendingDeleteCard = null;

document.getElementById('task-container').addEventListener('click', function (e) {
    if (e.target.classList.contains('delete-link')) {
        pendingDeleteCard = e.target.closest('.task-card');
        openModal('confirm-delete-modal');
    }
});

document.getElementById('delete-confirm-btn').addEventListener('click', function () {
    if (pendingDeleteCard) {
        var taskId = pendingDeleteCard.getAttribute('data-task-id');
        tasks = tasks.filter(function (t) { return t.id !== taskId; });
        saveTasks(tasks);

        pendingDeleteCard.remove();
        pendingDeleteCard = null;
        updateProgressBar();
        saveStats();
    }
    closeModal('confirm-delete-modal');
});

// ==========================================
// EDIT TASK (custom modal)
// ==========================================

var pendingEditCard = null;

document.getElementById('task-container').addEventListener('click', function (e) {
    if (e.target.classList.contains('edit-link')) {
        pendingEditCard = e.target.closest('.task-card');
        var currentTitle = pendingEditCard.querySelector('strong').textContent;
        var currentDate = pendingEditCard.querySelector('p').textContent.replace('Deadline: ', '');

        document.getElementById('edit-task-name').value = currentTitle;
        document.getElementById('edit-task-date').value = currentDate === '--' ? '' : currentDate;
        openModal('edit-task-modal');
        setTimeout(function () { document.getElementById('edit-task-name').focus(); }, 100);
    }
});

document.getElementById('edit-confirm-btn').addEventListener('click', function () {
    if (pendingEditCard) {
        var newTitle = document.getElementById('edit-task-name').value.trim();
        var newDate = document.getElementById('edit-task-date').value;

        if (newTitle) pendingEditCard.querySelector('strong').textContent = newTitle;
        if (newDate) pendingEditCard.querySelector('p').textContent = 'Deadline: ' + newDate;

        // Sync to data
        var taskId = pendingEditCard.getAttribute('data-task-id');
        tasks = tasks.map(function (t) {
            if (t.id === taskId) {
                if (newTitle) t.name = newTitle;
                if (newDate) t.date = newDate;
            }
            return t;
        });
        saveTasks(tasks);

        pendingEditCard = null;
    }
    closeModal('edit-task-modal');
});

// ==========================================
// CHECKBOX - MARK COMPLETE
// ==========================================

document.getElementById('task-container').addEventListener('change', function (e) {
    if (e.target.type === 'checkbox') {
        var card = e.target.closest('.task-card');
        var taskId = card.getAttribute('data-task-id');
        var isChecked = e.target.checked;

        if (isChecked) {
            card.classList.add('completed');
        } else {
            card.classList.remove('completed');
        }

        // Sync completed state
        tasks = tasks.map(function (t) {
            if (t.id === taskId) t.completed = isChecked;
            return t;
        });
        saveTasks(tasks);

        updateProgressBar();
        saveStats();
    }
});

// ==========================================
// PROGRESS BAR
// ==========================================

function updateProgressBar() {
    var activeSubject = getActiveSubject();
    var cards = document.querySelectorAll('.task-card[data-subject="' + activeSubject + '"]');
    var total = cards.length;
    var done = 0;

    cards.forEach(function (card) {
        var cb = card.querySelector('input[type="checkbox"]');
        if (cb && cb.checked) done++;
    });

    var pct = total > 0 ? Math.round((done / total) * 100) : 0;

    document.getElementById('progress-bar').style.width = pct + '%';
    document.getElementById('progress-percentage').textContent = pct + '%';
    document.getElementById('progress-text').textContent = done + ' / ' + total + ' tasks completed';
}

// ==========================================
// SAVE STATS TO LOCALSTORAGE (for dashboard)
// ==========================================

function saveStats() {
    var total = tasks.length;
    var completed = tasks.filter(function (t) { return t.completed; }).length;
    localStorage.setItem('totalTasks', total);
    localStorage.setItem('completedTasks', completed);
    localStorage.setItem('totalSubjects', subjects.length);
}
