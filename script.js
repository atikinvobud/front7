// DOM элементы
const noteText = document.getElementById('noteText');
const saveNoteButton = document.getElementById('saveNote');
const notesContainer = document.getElementById('notesContainer');
const offlineIndicator = document.getElementById('offlineIndicator');

let notes = [];

// ====== LocalStorage ======
function loadNotes() {
  const storedNotes = localStorage.getItem('notes');
  if (storedNotes) {
    notes = JSON.parse(storedNotes);
  }
}

function saveNotes() {
  localStorage.setItem('notes', JSON.stringify(notes));
}

// ====== Отображение заметок ======
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

// ====== Добавление заметки ======
function addNote() {
  const text = noteText.value.trim();
  if (text !== '') {
    notes.push(text);
    saveNotes();
    displayNotes();
    noteText.value = '';
  }
}

// ====== Удаление заметки ======
function deleteNote(index) {
  notes.splice(index, 1);
  saveNotes();
  displayNotes();
}

// ====== Редактирование заметки ======
function editNote(index) {
  const newText = prompt('Редактировать заметку:', notes[index]);
  if (newText !== null && newText.trim() !== '') {
    notes[index] = newText.trim();
    saveNotes();
    displayNotes();
  }
}

// ====== Обновление индикатора "Офлайн-режим" ======
function updateIndicator() {
  if (navigator.onLine) {
    offlineIndicator.style.display = 'none';  // Скрываем индикатор, если есть интернет
  } else {
    offlineIndicator.style.display = 'block'; // Показываем индикатор, если интернета нет
  }
}

// ====== Инициализация ======
window.addEventListener('load', () => {
  loadNotes();
  displayNotes();
  updateIndicator(); // Проверим статус интернета при загрузке страницы

  // Периодическая проверка состояния интернета
  setInterval(updateIndicator, 5000); // каждые 5 секунд
});

// ====== Слушаем события для изменения состояния сети ======
window.addEventListener('online', updateIndicator);
window.addEventListener('offline', updateIndicator);

// ====== Кнопка сохранения заметки ======
saveNoteButton.addEventListener('click', addNote);
