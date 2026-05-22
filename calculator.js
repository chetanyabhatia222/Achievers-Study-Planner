// ==========================================
// SHARED SUBJECT LIST (synced from tasks page)
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
// BUILD CALCULATOR ROWS FROM SHARED SUBJECTS
// ==========================================

function buildCalcRows() {
    var subjects = loadSubjects();
    var container = document.getElementById('calc-subjects-container');
    var noSubjectsMsg = document.getElementById('calc-no-subjects');
    container.innerHTML = '';

    if (subjects.length === 0) {
        noSubjectsMsg.style.display = 'block';
        return;
    }
    noSubjectsMsg.style.display = 'none';

    subjects.forEach(function (sub) {
        var row = document.createElement('div');
        row.className = 'calc-subject-row';
        row.innerHTML =
            '<span class="calc-subject-name">' +
                '<span class="dot" style="background-color:' + sub.color + ';"></span>' +
                sub.name +
            '</span>' +
            '<input type="number" min="0" max="100" placeholder="Marks" data-subject="' + sub.id + '" data-name="' + sub.name + '">';
        container.appendChild(row);
    });
}

buildCalcRows();

// ==========================================
// GRADE MAPPING
// ==========================================

function getGrade(marks) {
    if (marks >= 90) return { grade: 'O',  points: 10, cssClass: 'grade-o' };
    if (marks >= 80) return { grade: 'A+', points: 9,  cssClass: 'grade-a-plus' };
    if (marks >= 70) return { grade: 'A',  points: 8,  cssClass: 'grade-a' };
    if (marks >= 60) return { grade: 'B+', points: 7,  cssClass: 'grade-b-plus' };
    if (marks >= 50) return { grade: 'B',  points: 6,  cssClass: 'grade-b' };
    if (marks >= 40) return { grade: 'C',  points: 5,  cssClass: 'grade-c' };
    return { grade: 'F', points: 0, cssClass: 'grade-f' };
}

// ==========================================
// CALCULATE GPA
// ==========================================

document.getElementById('calc-submit').addEventListener('click', function () {
    var inputs = document.querySelectorAll('#calc-subjects-container input[type="number"]');

    if (inputs.length === 0) {
        alert('Please add subjects from the Tasks page first.');
        return;
    }

    var totalPoints = 0;
    var count = 0;
    var breakdownHTML = '';

    inputs.forEach(function (input) {
        var marks = parseFloat(input.value);
        if (isNaN(marks) || marks < 0) marks = 0;
        if (marks > 100) marks = 100;

        var gradeInfo = getGrade(marks);
        totalPoints += gradeInfo.points;
        count++;

        var name = input.getAttribute('data-name') ||
                   input.closest('.calc-subject-row').querySelector('.calc-subject-name').textContent.trim();

        breakdownHTML +=
            '<div class="calc-breakdown-row">' +
            '<span>' + name + '<span class="calc-breakdown-marks">(' + marks + ' marks)</span></span>' +
            '<span class="calc-grade ' + gradeInfo.cssClass + '">' + gradeInfo.grade + ' &mdash; ' + gradeInfo.points + ' pts</span>' +
            '</div>';
    });

    var gpa = count > 0 ? (totalPoints / count).toFixed(2) : '0.00';

    document.getElementById('calc-gpa').textContent = gpa;
    document.getElementById('calc-breakdown').innerHTML = breakdownHTML;
    document.getElementById('calc-result-card').classList.remove('hidden');

    // Save to localStorage
    localStorage.setItem('currentGPA', gpa);

    // Update sidebar widget
    var sidebarGPA = document.getElementById('gpa-score');
    if (sidebarGPA) sidebarGPA.textContent = gpa;

    // Scroll to results
    document.getElementById('calc-result-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
});
