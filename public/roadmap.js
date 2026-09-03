document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('roadmapContent');
  if (!container) return;

  const tasks = [
    { title: "Faza 1: MVP - Podstawy Sklepu", status: "W trakcie", details: "System podnoszenia przedmiotów, półki, budynek sklepu." },
    { title: "Faza 2: Kasa i NPC", status: "Planowane", details: "Skanowanie towaru, sztuczna inteligencja kupujących." },
    { title: "Faza 3: Strefa Gastronomiczna", status: "Planowane", details: "Robienie hot-dogów, nalewanie napojów, podawanie клиенtom." },
    { title: "Faza 4: Rozbudowa i Zapis", status: "Planowane", details: "Kupowanie nowej kasy, zapis stanu monet i statystyk." }
  ];

  container.innerHTML = tasks.map(t => `
    <div class="card" style="margin-bottom: 16px;">
      <h3>${t.title}</h3>
      <span class="badge ${t.status === 'W trakcie' ? 'badge-wip' : 'badge-plan'}">${t.status}</span>
      <p>${t.details}</p>
    </div>
  `).join('');
});