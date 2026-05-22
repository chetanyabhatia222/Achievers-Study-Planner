// ==========================================
// SHARED SUBJECTS (synced from tasks page)
// ==========================================

var DEFAULT_SUBJECTS = [
    { id: 'ai',     name: 'Artificial Intelligence', color: '#9b59b6' },
    { id: 'python', name: 'Python Programming',      color: '#3498db' },
    { id: 'dm',     name: 'Disaster Management',     color: '#e67e22' },
    { id: 'math',   name: 'Discrete Mathematics',    color: '#2ecc71' }
];

function loadSubjects() {
    var raw = localStorage.getItem('achievers_subjects');
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_SUBJECTS));
}

// ==========================================
// TIMETABLE DATA
// ==========================================

var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
var PERIODS = [
    '1st  9:00 - 10:00',
    '2nd  10:00 - 11:00',
    '3rd  11:00 - 12:00',
    '4th  12:00 - 1:00',
    'Break',
    '5th  2:00 - 3:00',
    '6th  3:00 - 4:00',
];

function loadTimetable() {
    var raw = localStorage.getItem('achievers_timetable');
    if (raw) return JSON.parse(raw);
    var grid = {};
    PERIODS.forEach(function (p, pi) {
        grid[pi] = {};
        DAYS.forEach(function (d, di) { grid[pi][di] = null; });
    });
    return grid;
}

function saveTimetable(grid) {
    localStorage.setItem('achievers_timetable', JSON.stringify(grid));
}

var timetable = loadTimetable();

// ==========================================
// BUILD TABLE
// ==========================================

function buildTable() {
    var tbody = document.getElementById('timetable-body');
    tbody.innerHTML = '';

    PERIODS.forEach(function (periodLabel, pi) {
        var isBreak = periodLabel === 'Break' || periodLabel === 'Lunch';
        var tr = document.createElement('tr');

        var th = document.createElement('td');
        th.textContent = periodLabel;
        if (isBreak) {
            th.style.background = 'var(--bg-input-hover)';
            th.style.fontStyle = 'italic';
            th.style.color = 'var(--text-secondary)';
        }
        tr.appendChild(th);

        DAYS.forEach(function (day, di) {
            var td = document.createElement('td');
            if (isBreak) {
                td.style.background = 'var(--bg-input-hover)';
            } else {
                var entry = timetable[pi] ? timetable[pi][di] : null;
                td.appendChild(makeCellDiv(pi, di, entry));
            }
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
}

function makeCellDiv(pi, di, entry) {
    var div = document.createElement('div');
    div.className = 'tt-cell' + (entry ? ' filled' : '');
    div.setAttribute('data-pi', pi);
    div.setAttribute('data-di', di);

    if (entry) {
        var clearBtn = document.createElement('button');
        clearBtn.className = 'tt-clear';
        clearBtn.textContent = 'x';
        clearBtn.title = 'Clear cell';
        clearBtn.setAttribute('data-pi', pi);
        clearBtn.setAttribute('data-di', di);
        div.appendChild(clearBtn);

        var subjectSpan = document.createElement('span');
        subjectSpan.className = 'tt-subject';
        subjectSpan.textContent = entry.subject;
        div.appendChild(subjectSpan);

        if (entry.room) {
            var roomSpan = document.createElement('span');
            roomSpan.className = 'tt-room';
            roomSpan.textContent = entry.room;
            div.appendChild(roomSpan);
        }
    } else {
        var plus = document.createElement('span');
        plus.className = 'tt-plus';
        plus.textContent = '+';
        div.appendChild(plus);
    }

    return div;
}

buildTable();

// ==========================================
// POPULATE SUBJECT DROPDOWN
// ==========================================

function populateSubjectSelect() {
    var select = document.getElementById('tt-subject-select');
    var subjects = loadSubjects();
    select.innerHTML = '';

    if (subjects.length === 0) {
        var opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'No subjects — add them in My Tasks';
        select.appendChild(opt);
        return;
    }

    subjects.forEach(function (sub) {
        var opt = document.createElement('option');
        opt.value = sub.name;
        opt.textContent = sub.name;
        select.appendChild(opt);
    });

    // Add "Other (type below)" option
    var other = document.createElement('option');
    other.value = '__other__';
    other.textContent = 'Other (type below)';
    select.appendChild(other);
}

// Show/hide manual input when "Other" is selected
document.getElementById('tt-subject-select').addEventListener('change', function () {
    var otherInput = document.getElementById('tt-other-input');
    if (!otherInput) return;
    if (this.value === '__other__') {
        otherInput.style.display = 'block';
        otherInput.focus();
    } else {
        otherInput.style.display = 'none';
    }
});

// ==========================================
// CLICK HANDLERS
// ==========================================

var pendingPi = null;
var pendingDi = null;

document.getElementById('timetable-body').addEventListener('click', function (e) {
    // Clear button
    var clearBtn = e.target.closest('.tt-clear');
    if (clearBtn) {
        e.stopPropagation();
        var pi = clearBtn.getAttribute('data-pi');
        var di = clearBtn.getAttribute('data-di');
        timetable[pi][di] = null;
        saveTimetable(timetable);
        var td = clearBtn.closest('td');
        td.innerHTML = '';
        td.appendChild(makeCellDiv(pi, di, null));
        return;
    }

    // Cell click — open modal for empty cells only
    var cell = e.target.closest('.tt-cell');
    if (cell && !cell.classList.contains('filled')) {
        pendingPi = cell.getAttribute('data-pi');
        pendingDi = cell.getAttribute('data-di');
        document.getElementById('tt-room-input').value = '';
        document.getElementById('tt-modal-title').textContent =
            'Add Class — ' + DAYS[pendingDi] + ', Period ' + (parseInt(pendingPi) + 1);

        populateSubjectSelect();

        // Inject "other" text input if not present
        var existingOther = document.getElementById('tt-other-input');
        if (!existingOther) {
            var inp = document.createElement('input');
            inp.type = 'text';
            inp.id = 'tt-other-input';
            inp.placeholder = 'Enter subject name';
            inp.style.cssText = 'width:100%;margin-top:8px;display:none;';
            document.getElementById('tt-subject-select').insertAdjacentElement('afterend', inp);
        } else {
            existingOther.style.display = 'none';
            existingOther.value = '';
        }

        openModal('tt-entry-modal');
        setTimeout(function () { document.getElementById('tt-subject-select').focus(); }, 80);
    }
});

// Save button
document.getElementById('tt-save-btn').addEventListener('click', function () {
    var select = document.getElementById('tt-subject-select');
    var otherInput = document.getElementById('tt-other-input');
    var room = document.getElementById('tt-room-input').value.trim();

    var subjectName = '';
    if (select.value === '__other__') {
        subjectName = otherInput ? otherInput.value.trim() : '';
    } else {
        subjectName = select.value;
    }

    if (!subjectName) {
        select.style.borderColor = '#e74c3c';
        return;
    }
    select.style.borderColor = '';

    timetable[pendingPi][pendingDi] = { subject: subjectName, room: room };
    saveTimetable(timetable);

    // Update cell in DOM
    var cell = document.querySelector('.tt-cell[data-pi="' + pendingPi + '"][data-di="' + pendingDi + '"]');
    if (cell) {
        var td = cell.parentElement;
        td.innerHTML = '';
        td.appendChild(makeCellDiv(pendingPi, pendingDi, timetable[pendingPi][pendingDi]));
    }

    closeModal('tt-entry-modal');
});

// Room input Enter key
document.getElementById('tt-room-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('tt-save-btn').click();
});

// Clear All
document.getElementById('clear-all-tt').addEventListener('click', function () {
    openModal('tt-clear-modal');
});

document.getElementById('tt-clear-confirm-btn').addEventListener('click', function () {
    PERIODS.forEach(function (p, pi) {
        DAYS.forEach(function (d, di) { timetable[pi][di] = null; });
    });
    saveTimetable(timetable);
    buildTable();
    closeModal('tt-clear-modal');
});
