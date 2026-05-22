// ==========================================
// GUARD – redirect to landing if not logged in
// ==========================================

(function authGuard() {
    var user = localStorage.getItem('achievers_current_user');
    if (!user) {
        window.location.href = 'login.html';
    }
})();

// ==========================================
// THEME TOGGLE (shared across all pages)
// ==========================================

(function initTheme() {
    var saved = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', saved);
    var icon = document.getElementById('theme-icon');
    if (icon) icon.innerHTML = saved === 'dark' ? '&#9788;' : '&#9790;';
})();

var themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
    themeBtn.addEventListener('click', function () {
        var current = document.body.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        document.getElementById('theme-icon').innerHTML = next === 'dark' ? '&#9788;' : '&#9790;';
    });
}

// ==========================================
// LOAD USERNAME FROM LOCALSTORAGE
// ==========================================

(function loadUser() {
    var name = localStorage.getItem('userName');
    if (name) {
        var el = document.getElementById('sidebar-username');
        if (el) el.textContent = name;

        var avatar = document.getElementById('user-avatar');
        if (avatar) {
            var parts = name.trim().split(' ');
            var initials = parts.map(function (w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
            avatar.textContent = initials;
        }
    }
})();

// ==========================================
// LOAD GPA FROM LOCALSTORAGE
// ==========================================

(function loadGPA() {
    var gpa = localStorage.getItem('currentGPA');
    var el = document.getElementById('gpa-score');
    if (gpa && el) el.textContent = gpa;
})();

// ==========================================
// LOGOUT HANDLER
// ==========================================

var logoutLink = document.getElementById('logout-link');
if (logoutLink) {
    logoutLink.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('achievers_current_user');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        window.location.href = 'login.html';
    });
}

// ==========================================
// LIVE CLOCK
// ==========================================

function updateClock() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();
    var period = hours >= 12 ? 'PM' : 'AM';

    var displayHours = hours % 12;
    if (displayHours === 0) displayHours = 12;

    var h = displayHours < 10 ? '0' + displayHours : displayHours;
    var m = minutes < 10 ? '0' + minutes : minutes;
    var s = seconds < 10 ? '0' + seconds : seconds;

    var timeEl = document.getElementById('clock-time');
    var periodEl = document.getElementById('clock-period');
    var dateEl = document.getElementById('clock-date');

    if (timeEl) {
        timeEl.innerHTML = h + '<span class="clock-colon">:</span>' + m + '<span class="clock-colon">:</span>' + s;
    }
    if (periodEl) periodEl.textContent = period;

    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    if (dateEl) {
        dateEl.textContent = days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
    }

    var welcomeDate = document.getElementById('welcome-date');
    if (welcomeDate) {
        welcomeDate.textContent = days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
    }
}

updateClock();
setInterval(updateClock, 1000);

// ==========================================
// CUSTOM MODAL HELPERS (shared)
// ==========================================

function openModal(modalId) {
    var el = document.getElementById(modalId);
    if (el) el.classList.remove('hidden');
}

function closeModal(modalId) {
    var el = document.getElementById(modalId);
    if (el) el.classList.add('hidden');
}

document.addEventListener('click', function (e) {
    if (e.target.classList.contains('custom-modal-close') || e.target.classList.contains('modal-cancel-btn')) {
        var modalId = e.target.getAttribute('data-modal');
        if (modalId) closeModal(modalId);
    }

    if (e.target.classList.contains('custom-modal')) {
        e.target.classList.add('hidden');
    }
});
