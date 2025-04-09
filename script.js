const noteText = document.getElementById('noteText');
const saveNoteButton = document.getElementById('saveNote');
const notesContainer = document.getElementById('notesContainer');
const offlineIndicator = document.getElementById('offlineIndicator');

let notes = [];

function loadNotes() {
  const storedNotes = localStorage.getItem('notes');
  if (storedNotes) {
    notes = JSON.parse(storedNotes);
  }
}

function saveNotes() {
  localStorage.setItem('notes', JSON.stringify(notes));
}

function displayNotes() {
  notesContainer.innerHTML = '';

  notes.forEach((note, index) => {
    const li = document.createElement('li');
    li.classList.add('note-item');

    const span = document.createElement('span');
    span.classList.add('note-content');
    span.textContent = note;
    span.addEventListener('click', () => editNote(index));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить';
    deleteBtn.classList.add('delete-button');
    deleteBtn.addEventListener('click', () => deleteNote(index));

    li.appendChild(span);
    li.appendChild(deleteBtn);

    notesContainer.appendChild(li);
  });
}

function addNote() {
  const text = noteText.value.trim();
  if (text !== '') {
    notes.push(text);
    saveNotes();
    displayNotes();
    noteText.value = '';
  }
}

function deleteNote(index) {
  notes.splice(index, 1);
  saveNotes();
  displayNotes();
}

function editNote(index) {
  const newText = prompt('Редактировать заметку:', notes[index]);
  if (newText !== null && newText.trim() !== '') {
    notes[index] = newText.trim();
    saveNotes();
    displayNotes();
  }
}

function updateConnectionStatus() {
  fetch("https://www.gstatic.com/generate_204", {
    method: "GET",
    mode: "no-cors",
    cache: "no-store"
  })
    .then(() => {
      offlineIndicator.style.display = "none"; 
    })
    .catch(() => {
      offlineIndicator.style.display = "block";
    });
}

window.addEventListener('load', () => {
  loadNotes();
  displayNotes();
  updateConnectionStatus(); 

  setInterval(updateConnectionStatus, 5000);
});

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);

saveNoteButton.addEventListener('click', addNote);
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker успешно зарегистрирован:', registration.scope);
      })
      .catch((error) => {
        console.error('Ошибка при регистрации Service Worker:', error);
      });
  });
}