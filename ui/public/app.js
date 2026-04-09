const trailList = document.getElementById('trail-list');
const searchInput = document.getElementById('search');
const entriesDiv = document.getElementById('entries');
const welcomeDiv = document.getElementById('welcome');
const detailContent = document.getElementById('detail-content');
const detailPlaceholder = document.getElementById('detail-placeholder');
const btnPriority = document.getElementById('btn-priority');

let trails = [];
let activeSlug = null;

async function loadTrails() {
  const res = await fetch('/api/trails');
  trails = await res.json();
  renderTrailList(trails);
}

function renderTrailList(list) {
  trailList.innerHTML = '';
  list.forEach(t => {
    const li = document.createElement('li');
    if (t.slug === activeSlug) li.classList.add('active');
    li.innerHTML = `
      <div class="trail-title">${esc(t.title)}</div>
      <div class="trail-meta">
        <span class="badge badge-active">${esc(t.status)}</span>
        <span class="badge badge-count">${t.entryCount} entries</span>
        <span>${esc(t.date)}</span>
      </div>
    `;
    li.addEventListener('click', () => selectTrail(t.slug));
    trailList.appendChild(li);
  });
}

async function selectTrail(slug) {
  activeSlug = slug;
  renderTrailList(filterTrails());

  const res = await fetch(`/api/trails/${slug}`);
  const entries = await res.json();

  welcomeDiv.classList.add('hidden');
  entriesDiv.classList.remove('hidden');
  entriesDiv.innerHTML = '';

  // Show detail of first entry by default
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
      // Internal .md link — navigate to that entry
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

btnPriority.addEventListener('click', async () => {
  activeSlug = null;
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
