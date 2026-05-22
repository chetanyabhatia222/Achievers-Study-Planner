// ==========================================
// NOTES - localStorage persistence
// ==========================================

function loadNotes() {
    var raw = localStorage.getItem('achievers_notes');
    return raw ? JSON.parse(raw) : [];
}

function saveNotes(arr) {
    localStorage.setItem('achievers_notes', JSON.stringify(arr));
}

function formatDate(isoString) {
    var d = new Date(isoString);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + '  ' + time;
}

// In-memory array — source of truth
var notes = loadNotes();

// ==========================================
// RENDER NOTES GRID
// ==========================================

function renderNotes() {
    var grid = document.getElementById('notes-grid');
    grid.innerHTML = '';

    if (notes.length === 0) {
        var empty = document.createElement('div');
        empty.className = 'notes-empty';
        empty.innerHTML = '<span>No notes yet.</span>Click <strong>+ New Note</strong> to get started!';
        grid.appendChild(empty);
        return;
    }

    // Newest first
    var sorted = notes.slice().sort(function (a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    sorted.forEach(function (note) {
        var card = document.createElement('div');
        card.className = 'note-card';
        card.setAttribute('data-note-id', note.id);

        // Delete button (hover)
        var delBtn = document.createElement('button');
        delBtn.className = 'note-delete-btn';
        delBtn.textContent = 'x';
        delBtn.title = 'Delete note';
        delBtn.setAttribute('data-note-id', note.id);
        card.appendChild(delBtn);

        // Title
        var titleEl = document.createElement('div');
        titleEl.className = 'note-card-title';
        titleEl.textContent = note.title || 'Untitled';
        card.appendChild(titleEl);

        // Body preview (first 120 chars)
        if (note.body) {
            var bodyEl = document.createElement('div');
            bodyEl.className = 'note-card-body';
            var preview = note.body.length > 120 ? note.body.slice(0, 120) + '...' : note.body;
            bodyEl.textContent = preview;
            card.appendChild(bodyEl);
        }

        // Date
        var dateEl = document.createElement('div');
        dateEl.className = 'note-card-date';
        dateEl.textContent = formatDate(note.createdAt);
        card.appendChild(dateEl);

        grid.appendChild(card);
    });
}

renderNotes();

// ==========================================
// ADD NOTE
// ==========================================

document.getElementById('add-note-btn').addEventListener('click', function () {
    document.getElementById('note-title-input').value = '';
    document.getElementById('note-body-input').value = '';
    document.getElementById('note-modal-error').style.display = 'none';
    openModal('add-note-modal');
    setTimeout(function () {
        document.getElementById('note-title-input').focus();
    }, 80);
});

document.getElementById('save-note-btn').addEventListener('click', function () {
    var titleInput = document.getElementById('note-title-input');
    var bodyInput  = document.getElementById('note-body-input');
    var errorEl    = document.getElementById('note-modal-error');

    var title = titleInput.value.trim();
    var body  = bodyInput.value.trim();

    // Reset error
    errorEl.style.display = 'none';
    titleInput.style.borderColor = '';
    bodyInput.style.borderColor = '';

    if (!title && !body) {
        errorEl.style.display = 'block';
        titleInput.style.borderColor = '#e74c3c';
        return;
    }

    var newNote = {
        id: 'note_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        title: title || 'Untitled',
        body: body,
        createdAt: new Date().toISOString()
    };

    notes.push(newNote);
    saveNotes(notes);
    renderNotes();
    closeModal('add-note-modal');
});

// Enter in title field → move focus to body
document.getElementById('note-title-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('note-body-input').focus();
    }
});

// Ctrl/Cmd + Enter in body → save
document.getElementById('note-body-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        document.getElementById('save-note-btn').click();
    }
    // Clear red border on typing
    this.style.borderColor = '';
});

// ==========================================
// PREVIEW NOTE (click on card body / title)
// ==========================================

var previewingNoteId = null;

document.getElementById('notes-grid').addEventListener('click', function (e) {
    // Ignore delete button clicks
    if (e.target.closest('.note-delete-btn')) return;

    var card = e.target.closest('.note-card');
    if (!card) return;

    var noteId = card.getAttribute('data-note-id');
    var note = notes.find(function (n) { return n.id === noteId; });
    if (!note) return;

    previewingNoteId = noteId;
    document.getElementById('preview-note-title').textContent = note.title || 'Untitled';
    document.getElementById('preview-note-date').textContent = formatDate(note.createdAt);
    document.getElementById('preview-note-body').textContent = note.body || '(No content)';
    openModal('preview-note-modal');
});

// Delete from preview
document.getElementById('preview-delete-btn').addEventListener('click', function () {
    closeModal('preview-note-modal');
    if (previewingNoteId) {
        pendingDeleteNoteId = previewingNoteId;
        openModal('delete-note-modal');
    }
});

// ==========================================
// DELETE NOTE
// ==========================================

var pendingDeleteNoteId = null;

document.getElementById('notes-grid').addEventListener('click', function (e) {
    var btn = e.target.closest('.note-delete-btn');
    if (!btn) return;
    pendingDeleteNoteId = btn.getAttribute('data-note-id');
    openModal('delete-note-modal');
});

document.getElementById('delete-note-confirm-btn').addEventListener('click', function () {
    if (pendingDeleteNoteId) {
        notes = notes.filter(function (n) { return n.id !== pendingDeleteNoteId; });
        saveNotes(notes);
        renderNotes();
        pendingDeleteNoteId = null;
    }
    closeModal('delete-note-modal');
});
