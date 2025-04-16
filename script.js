/* script.js */

// Лог при загрузке для отладки
console.log('script.js загружен, notificationsEnabled =', localStorage.getItem('notificationsEnabled'));

// Получение DOM-элементов
const noteText = document.getElementById('noteText');
const saveNoteButton = document.getElementById('saveNote');
const notesContainer = document.getElementById('notesContainer');
const offlineIndicator = document.getElementById('offlineIndicator');
const enableNotificationsButton = document.getElementById('enableNotifications');
const unsubscribeNotificationsButton = document.getElementById('unsubscribeNotifications');
const filterButtons = document.querySelectorAll('[data-filter]');

let notes = [];
let filter = 'all';

// Флаг включённых уведомлений (храним в localStorage)
let notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';

// Загрузка задач
function loadNotes() {
  const storedNotes = localStorage.getItem('notes');
  if (storedNotes) notes = JSON.parse(storedNotes);
}

// Сохранение задач
function saveNotes() {
  localStorage.setItem('notes', JSON.stringify(notes));
}

// Отображение задач
function displayNotes() {
  notesContainer.innerHTML = '';
  notes
    .filter(note => filter === 'all'
      ? true
      : (filter === 'active' ? !note.completed : note.completed)
    )
    .forEach((note, index) => {
      const li = document.createElement('li');
      li.className = 'note-item' + (note.completed ? ' completed' : '');

      const span = document.createElement('span');
      span.className = 'note-content';
      span.textContent = note.text;
      span.addEventListener('click', () => toggleNoteStatus(index));

      const del = document.createElement('button');
      del.textContent = 'Удалить';
      del.className = 'delete-button';
      del.addEventListener('click', () => deleteNote(index));

      li.append(span, del);
      notesContainer.appendChild(li);
    });
}

// Добавление новой задачи
function addNote() {
  const text = noteText.value.trim();
  if (!text) return;
  notes.push({ text, completed: false });
  saveNotes();
  displayNotes();
  noteText.value = '';
  showNotification('Задача добавлена!');
}

// Удаление задачи
function deleteNote(i) {
  notes.splice(i, 1);
  saveNotes();
  displayNotes();
}

// Переключение статуса задачи
function toggleNoteStatus(i) {
  notes[i].completed = !notes[i].completed;
  saveNotes();
  displayNotes();
}

// Обработка фильтров
filterButtons.forEach(btn =>
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    displayNotes();
  })
);

// Проверка статуса сети
function updateConnectionStatus() {
  fetch('https://www.gstatic.com/generate_204', { mode: 'no-cors' })
    .then(() => offlineIndicator.style.display = 'none')
    .catch(() => offlineIndicator.style.display = 'block');
}

// Показ системного уведомления, если разрешено и флаг включен
function showNotification(message) {
  if (Notification.permission === 'granted' && notificationsEnabled) {
    navigator.serviceWorker.ready
      .then(reg => reg.showNotification(message))
      .catch(console.error);
  }
}

// Подписка на уведомления (управляется локальным флагом)
enableNotificationsButton.addEventListener('click', () => {
  if (notificationsEnabled) {
    return alert('Уведомления уже включены!');
  }

  if (Notification.permission === 'default') {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') {
        notificationsEnabled = true;
        localStorage.setItem('notificationsEnabled', 'true');
        alert('Уведомления включены!');
      } else {
        alert('Разрешение на уведомления не получено.');
      }
    });
  } else if (Notification.permission === 'granted') {
    notificationsEnabled = true;
    localStorage.setItem('notificationsEnabled', 'true');
    alert('Уведомления включены!');
  } else {
    alert('Уведомления запрещены в настройках браузера.');
  }
});

// Отписка от уведомлений (выключение флага)
unsubscribeNotificationsButton.addEventListener('click', () => {
  if (!notificationsEnabled) {
    return alert('Уведомления уже отключены.');
  }
  notificationsEnabled = false;
  localStorage.setItem('notificationsEnabled', 'false');
  alert('Вы отписались от уведомлений.');
});

// Напоминания о невыполненных задачах (для теста — каждые 10 с, потом 2 ч)
setInterval(() => {
  if (notes.some(n => !n.completed)) {
    showNotification('У вас есть невыполненные задачи!');
  }
}, 10 * 1000);

// Инициализация при загрузке страницы
window.addEventListener('load', () => {
  loadNotes();
  displayNotes();
  updateConnectionStatus();
  setInterval(updateConnectionStatus, 5000);
});

// Регистрация Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(reg => console.log('SW зарегистрирован:', reg.scope))
    .catch(err => console.error('Ошибка SW:', err));
}

// Привязка кнопки добавления задачи
saveNoteButton.addEventListener('click', addNote);
