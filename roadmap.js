import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// KONFIGURACJA FIREBASE
const firebaseConfig = {
  apiKey: "TWOJE_API_KEY",
  authDomain: "ropucha-shop-roblox-studio.firebaseapp.com",
  projectId: "ropucha-shop-roblox-studio",
  storageBucket: "ropucha-shop-roblox-studio.appspot.com",
  appId: "TWOJE_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// LISTA ADRESÓW UPRAWNIONYCH DO EDYCJI
const ALLOWED_ADMINS = [
  "twoj-email@gmail.com"
];

// STAN APLIKACJI
let isAdmin = false;
let currentFilter = 'all';
let searchQuery = '';
let visibleLimit = 3;

// DANE DEMO
let modulesData = [
  {
    id: 'm1',
    title: '🏆 System Kasy Fiskalnej',
    tasks: [
      { id: 't1', title: 'Skanowanie produktów czytnikiem', status: 'done' },
      { id: 't2', title: 'Wydawanie reszty w monetach', status: 'done' },
      { id: 't3', title: 'Generowanie paragonu', status: 'done' }
    ]
  },
  {
    id: 'm2',
    title: '🛠️ Budowanie Sklepu i Meble',
    tasks: [
      { id: 't4', title: 'System stawiania półek na siatce (Grid)', status: 'done' },
      { id: 't5', title: 'Rozkładanie towarów na półki', status: 'progress' },
      { id: 't6', title: 'Hurtownia mebli i dostawy', status: 'plan' }
    ]
  },
  {
    id: 'm3',
    title: '🌭 Strefa Hot-Dogów',
    tasks: [
      { id: 't7', title: 'Grillowanie parówek (Minigra)', status: 'plan' },
      { id: 't8', title: 'Dodawanie sosów', status: 'plan' }
    ]
  }
];

// INIT
document.addEventListener('DOMContentLoaded', () => {
  setupAuth();
  setupEvents();
  renderRoadmap();
});

// LOGOWANIE
function setupAuth() {
  const authBtn = document.getElementById('authBtn');
  const userInfo = document.getElementById('userInfo');
  const userEmail = document.getElementById('userEmail');
  const adminActionBox = document.getElementById('adminActionBox');

  authBtn.addEventListener('click', () => {
    if (auth.currentUser) {
      signOut(auth);
    } else {
      signInWithPopup(auth, provider).catch(err => console.error(err));
    }
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      isAdmin = ALLOWED_ADMINS.includes(user.email);
      userEmail.textContent = user.email;
      document.getElementById('authBtnText').textContent = 'Wyloguj';
      userInfo.classList.remove('hidden');
      
      if (isAdmin) {
        adminActionBox.classList.remove('hidden');
      } else {
        adminActionBox.classList.add('hidden');
      }
    } else {
      isAdmin = false;
      document.getElementById('authBtnText').textContent = 'Logowanie zespołu';
      userInfo.classList.add('hidden');
      adminActionBox.classList.add('hidden');
    }
    renderRoadmap();
  });
}

// EVENTS
function setupEvents() {
  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderRoadmap();
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderRoadmap();
    });
  });

  document.getElementById('loadMoreBtn').addEventListener('click', () => {
    visibleLimit += 3;
    renderRoadmap();
  });

  document.getElementById('addModuleBtn').addEventListener('click', () => {
    const title = prompt('Nazwa nowego modułu:');
    if (title) {
      modulesData.push({
        id: 'm_' + Date.now(),
        title: title,
        tasks: []
      });
      renderRoadmap();
    }
  });
}

// WYLICZANIE POSTĘPU
function calculateModuleStats(module) {
  if (module.tasks.length === 0) return { percent: 0, isComplete: false };
  const doneCount = module.tasks.filter(t => t.status === 'done').length;
  const percent = Math.round((doneCount / module.tasks.length) * 100);
  return { percent, isComplete: percent === 100 };
}

// RENDERING I SORTOWANIE
function renderRoadmap() {
  const container = document.getElementById('modulesContainer');
  container.innerHTML = '';

  // Sortowanie: 100% zrobione -> W trakcie -> Szare
  let processedModules = [...modulesData].map(mod => {
    const stats = calculateModuleStats(mod);
    return { ...mod, stats };
  });

  processedModules.sort((a, b) => b.stats.percent - a.stats.percent);

  // Filtrowanie i szukanie
  let filtered = processedModules.filter(mod => {
    const matchesSearch = mod.title.toLowerCase().includes(searchQuery) ||
      mod.tasks.some(t => t.title.toLowerCase().includes(searchQuery));

    if (!matchesSearch) return false;

    if (currentFilter === 'completed') return mod.stats.isComplete;
    if (currentFilter === 'progress') return mod.stats.percent > 0 && !mod.stats.isComplete;
    if (currentFilter === 'planned') return mod.stats.percent === 0;

    return true;
  });

  // Limit widoczności ("Pokaż więcej")
  const visibleModules = filtered.slice(0, visibleLimit);
  const hiddenCount = filtered.length - visibleModules.length;

  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (hiddenCount > 0) {
    loadMoreBtn.classList.remove('hidden');
    document.getElementById('hiddenCount').textContent = hiddenCount;
  } else {
    loadMoreBtn.classList.add('hidden');
  }

  // Generowanie HTML
  visibleModules.forEach(mod => {
    const card = document.createElement('div');
    card.className = `module-card ${mod.stats.isComplete ? 'completed' : ''}`;

    let tasksHTML = mod.tasks.map(t => `
      <li class="task-item">
        <div class="task-info">
          <span class="status-dot ${t.status}"></span>
          <span>${t.title}</span>
        </div>
        ${isAdmin ? `
          <div class="task-controls">
            <select onchange="window.updateTaskStatus('${mod.id}', '${t.id}', this.value)">
              <option value="done" ${t.status === 'done' ? 'selected' : ''}>🟢 Zrobione</option>
              <option value="progress" ${t.status === 'progress' ? 'selected' : ''}>🟡 W trakcie</option>
              <option value="plan" ${t.status === 'plan' ? 'selected' : ''}>⚪ Plan</option>
            </select>
            <button class="btn-icon-danger" onclick="window.deleteTask('${mod.id}', '${t.id}')"><i class="ph-bold ph-trash"></i></button>
          </div>
        ` : ''}
      </li>
    `).join('');

    card.innerHTML = `
      <div class="module-header">
        <h3 class="module-title">${mod.title}</h3>
        <span class="progress-badge">${mod.stats.percent}%</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: ${mod.stats.percent}%"></div>
      </div>
      <ul class="task-list">
        ${tasksHTML}
      </ul>
      ${isAdmin ? `
        <button style="margin-top:12px;" onclick="window.addTask('${mod.id}')">+ Dodaj zadanie</button>
      ` : ''}
    `;

    container.appendChild(card);
  });
}

// GLOBALNE METODY DLA ADMINA
window.updateTaskStatus = (moduleId, taskId, newStatus) => {
  const mod = modulesData.find(m => m.id === moduleId);
  if (mod) {
    const task = mod.tasks.find(t => t.id === taskId);
    if (task) task.status = newStatus;
  }
  renderRoadmap();
};

window.addTask = (moduleId) => {
  const title = prompt('Nazwa nowego zadania:');
  if (title) {
    const mod = modulesData.find(m => m.id === moduleId);
    if (mod) {
      mod.tasks.push({ id: 't_' + Date.now(), title, status: 'plan' });
      renderRoadmap();
    }
  }
};

window.deleteTask = (moduleId, taskId) => {
  const mod = modulesData.find(m => m.id === moduleId);
  if (mod) {
    mod.tasks = mod.tasks.filter(t => t.id !== taskId);
    renderRoadmap();
  }
};