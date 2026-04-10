const trailList = document.getElementById('trail-list');
const searchInput = document.getElementById('search');
const entriesDiv = document.getElementById('entries');
const welcomeDiv = document.getElementById('welcome');
const detailContent = document.getElementById('detail-content');
const detailPlaceholder = document.getElementById('detail-placeholder');
const btnDaily = document.getElementById('btn-daily');
const btnPriority = document.getElementById('btn-priority');
const tabs = document.querySelectorAll('.tab');
const themePicker = document.getElementById('theme-picker');

const themes = [
  { id: 'midnight', name: 'Midnight' },
  { id: 'nord', name: 'Nord' },
  { id: 'solarized', name: 'Solarized' },
  { id: 'dracula', name: 'Dracula' },
  { id: 'github-dark', name: 'GitHub Dark' },
  { id: 'catppuccin', name: 'Catppuccin' },
  { id: 'gruvbox', name: 'Gruvbox' },
];

themes.forEach(t => {
  const opt = document.createElement('option');
  opt.value = t.id;
  opt.textContent = t.name;
  themePicker.appendChild(opt);
});

const savedTheme = localStorage.getItem('trail-theme') || 'midnight';
document.documentElement.setAttribute('data-theme', savedTheme);
themePicker.value = savedTheme;

themePicker.addEventListener('change', () => {
  document.documentElement.setAttribute('data-theme', themePicker.value);
  localStorage.setItem('trail-theme', themePicker.value);
});

let trails = [];
let activeSlug = null;
let activeTab = 'active';

const tabEndpoints = {
  backlog: '/api/trails/backlog',
  active: '/api/trails/active',
  archive: '/api/trails/archived',
};

async function loadTrails() {
  const endpoint = tabEndpoints[activeTab] || '/api/trails/active';
  const res = await fetch(endpoint);
  trails = await res.json();
  renderTrailList(filterTrails());
}

function renderTrailList(list) {
  trailList.innerHTML = '';
  list.forEach(t => {
    const li = document.createElement('li');
    if (t.slug === activeSlug) li.classList.add('active');
    li.innerHTML = `
      <div class="trail-title" title="${esc(t.title)}">${esc(t.title)}</div>
      <div class="trail-slug" title="${esc(t.slug)}">${esc(t.slug)}</div>
    `;
    li.addEventListener('click', () => selectTrail(t.slug));
    trailList.appendChild(li);
  });
}

async function selectTrail(slug) {
  activeSlug = slug;
  clearSpecialButtons();
  renderTrailList(filterTrails());

  const res = await fetch(`/api/trails/${slug}`);
  const entries = await res.json();

  welcomeDiv.classList.add('hidden');
  entriesDiv.classList.remove('hidden');
  entriesDiv.innerHTML = '';

  if (entries.length > 0) {
    showDetail(entries[0]);
  }

  entries.forEach((entry, i) => {
    const card = document.createElement('div');
    card.className = 'entry-card';
    if (i === 0) card.classList.add('active');
    card.innerHTML = `
      <h3>${esc(entry.title)}</h3>
      <div class="entry-filename">${esc(entry.filename)}</div>
    `;
    card.addEventListener('click', () => {
      document.querySelectorAll('.entry-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      showDetail(entry);
    });
    entriesDiv.appendChild(card);
  });
}

function showDetail(entry) {
  detailPlaceholder.classList.add('hidden');
  detailContent.classList.remove('hidden');
  detailContent.innerHTML = entry.html;
  detailContent.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.endsWith('.md') && !href.startsWith('http')) {
      a.addEventListener('click', e => {
        e.preventDefault();
        const filename = href.split('/').pop();
        const card = [...document.querySelectorAll('.entry-card')].find(
          c => c.querySelector('.entry-filename')?.textContent === filename
        );
        if (card) card.click();
      });
    } else {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    }
  });
}

function filterTrails() {
  const q = searchInput.value.toLowerCase();
  if (!q) return trails;
  return trails.filter(t =>
    t.title.toLowerCase().includes(q) ||
    t.slug.toLowerCase().includes(q)
  );
}

searchInput.addEventListener('input', () => {
  renderTrailList(filterTrails());
});

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeTab = tab.dataset.tab;
    activeSlug = null;
    clearSpecialButtons();
    searchInput.value = '';
    welcomeDiv.classList.remove('hidden');
    entriesDiv.classList.add('hidden');
    detailContent.classList.add('hidden');
    detailPlaceholder.classList.remove('hidden');
    loadTrails();
  });
});

function clearSpecialButtons() {
  btnDaily.classList.remove('active');
  btnPriority.classList.remove('active');
}

btnDaily.addEventListener('click', async () => {
  activeSlug = null;
  clearSpecialButtons();
  btnDaily.classList.add('active');
  renderTrailList(filterTrails());

  try {
    const res = await fetch('/api/daily');
    const summaries = await res.json();
    if (!summaries.length) throw new Error('No daily summaries');

    welcomeDiv.classList.add('hidden');
    entriesDiv.classList.remove('hidden');
    entriesDiv.innerHTML = '';

    if (summaries.length > 0) {
      detailPlaceholder.classList.add('hidden');
      detailContent.classList.remove('hidden');
      detailContent.innerHTML = summaries[0].html;
    }

    summaries.forEach((s, i) => {
      const card = document.createElement('div');
      card.className = 'entry-card';
      if (i === 0) card.classList.add('active');
      card.innerHTML = `
        <h3>${esc(s.date)}</h3>
        <div class="entry-filename">${esc(s.filename)}</div>
      `;
      card.addEventListener('click', () => {
        document.querySelectorAll('.entry-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        detailPlaceholder.classList.add('hidden');
        detailContent.classList.remove('hidden');
        detailContent.innerHTML = s.html;
      });
      entriesDiv.appendChild(card);
    });
  } catch (e) {
    detailPlaceholder.classList.remove('hidden');
    detailContent.classList.add('hidden');
    detailPlaceholder.innerHTML = '<p>No daily summaries found. Run /trail:daily first.</p>';
  }
});

btnPriority.addEventListener('click', async () => {
  activeSlug = null;
  clearSpecialButtons();
  btnPriority.classList.add('active');
  renderTrailList(filterTrails());

  try {
    const res = await fetch('/api/priority-report');
    if (!res.ok) throw new Error('No priority report found');
    const data = await res.json();

    welcomeDiv.classList.add('hidden');
    entriesDiv.classList.remove('hidden');
    entriesDiv.innerHTML = '<div class="entry-card active"><h3>Priority Report</h3><div class="entry-filename">priority-report.md</div></div>';

    detailPlaceholder.classList.add('hidden');
    detailContent.classList.remove('hidden');
    detailContent.innerHTML = data.html;
  } catch (e) {
    detailPlaceholder.classList.remove('hidden');
    detailContent.classList.add('hidden');
    detailPlaceholder.innerHTML = '<p>No priority report found. Run /trail:prioritize first.</p>';
  }
});

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

loadTrails();
