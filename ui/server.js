const express = require('express');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const app = express();
const TRAIL_DIR = process.env.TRAIL_DIR || path.join(require('os').homedir(), 'trail');

app.use(express.static(path.join(__dirname, 'public')));

function readTrailsFromDir(dir, location) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries
    .filter(e => e.isDirectory() && e.name !== '.git')
    .map(e => {
      const trailheadPath = path.join(dir, e.name, '00-trailhead.md');
      let title = e.name;
      let status = 'unknown';
      let ticket = 'none';
      let date = '';

      if (fs.existsSync(trailheadPath)) {
        const content = fs.readFileSync(trailheadPath, 'utf-8');
        const titleMatch = content.match(/^#\s+(.+)$/m);
        if (titleMatch) title = titleMatch[1];
        const statusMatch = content.match(/\*\*Status:\*\*\s*(.+)/);
        if (statusMatch) status = statusMatch[1].trim();
        const ticketMatch = content.match(/\*\*Ticket:\*\*\s*(.+)/);
        if (ticketMatch) ticket = ticketMatch[1].trim();
        const dateMatch = content.match(/\*\*Date:\*\*\s*(.+)/);
        if (dateMatch) date = dateMatch[1].trim();
      }

      const files = fs.readdirSync(path.join(dir, e.name))
        .filter(f => f.endsWith('.md'))
        .sort();

      return { slug: e.name, title, status, ticket, date, entryCount: files.length, location };
    })
    .sort((a, b) => b.slug.localeCompare(a.slug));
}

// List backlog trails
app.get('/api/trails/backlog', (req, res) => {
  try {
    const backlogTrails = readTrailsFromDir(path.join(TRAIL_DIR, 'backlog'), 'backlog');
    // Include legacy top-level trails in backlog view
    const legacyEntries = fs.readdirSync(TRAIL_DIR, { withFileTypes: true });
    const legacyTrails = legacyEntries
      .filter(e => e.isDirectory() && !['backlog', 'active', 'archive', 'daily', '.git'].includes(e.name))
      .map(e => {
        const trailheadPath = path.join(TRAIL_DIR, e.name, '00-trailhead.md');
        let title = e.name;
        let status = 'unknown';
        let ticket = 'none';
        let date = '';

        if (fs.existsSync(trailheadPath)) {
          const content = fs.readFileSync(trailheadPath, 'utf-8');
          const titleMatch = content.match(/^#\s+(.+)$/m);
          if (titleMatch) title = titleMatch[1];
          const statusMatch = content.match(/\*\*Status:\*\*\s*(.+)/);
          if (statusMatch) status = statusMatch[1].trim();
          const ticketMatch = content.match(/\*\*Ticket:\*\*\s*(.+)/);
          if (ticketMatch) ticket = ticketMatch[1].trim();
          const dateMatch = content.match(/\*\*Date:\*\*\s*(.+)/);
          if (dateMatch) date = dateMatch[1].trim();
        }

        const files = fs.readdirSync(path.join(TRAIL_DIR, e.name))
          .filter(f => f.endsWith('.md'))
          .sort();

        return { slug: e.name, title, status, ticket, date, entryCount: files.length, location: 'legacy' };
      });

    const all = [...backlogTrails, ...legacyTrails].sort((a, b) => b.slug.localeCompare(a.slug));
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List active (WIP) trails
app.get('/api/trails/active', (req, res) => {
  try {
    const trails = readTrailsFromDir(path.join(TRAIL_DIR, 'active'), 'active');
    res.json(trails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get archived trails
app.get('/api/trails/archived', (req, res) => {
  try {
    const trails = readTrailsFromDir(path.join(TRAIL_DIR, 'archive'), 'archive');
    res.json(trails.map(t => ({ ...t, status: 'archived', archived: true })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all entries for a trail — search all locations
app.get('/api/trails/:slug', (req, res) => {
  try {
    const slug = req.params.slug;
    const candidates = [
      path.join(TRAIL_DIR, 'active', slug),
      path.join(TRAIL_DIR, 'backlog', slug),
      path.join(TRAIL_DIR, slug),
      path.join(TRAIL_DIR, 'archive', slug),
    ];

    const trailDir = candidates.find(d => fs.existsSync(d));
    if (!trailDir) return res.status(404).json({ error: 'Trail not found' });

    const files = fs.readdirSync(trailDir)
      .filter(f => f.endsWith('.md'))
      .sort();

    const entries = files.map(f => {
      const content = fs.readFileSync(path.join(trailDir, f), 'utf-8');
      const titleMatch = content.match(/^#\s+(.+)$/m);
      return {
        filename: f,
        title: titleMatch ? titleMatch[1] : f.replace('.md', ''),
        markdown: content,
        html: marked(content),
      };
    });

    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get daily summaries list
app.get('/api/daily', (req, res) => {
  try {
    const dailyDir = path.join(TRAIL_DIR, 'daily');
    if (!fs.existsSync(dailyDir)) return res.json([]);

    const files = fs.readdirSync(dailyDir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse();

    const summaries = files.map(f => {
      const content = fs.readFileSync(path.join(dailyDir, f), 'utf-8');
      return {
        filename: f,
        date: f.replace('.md', ''),
        markdown: content,
        html: marked(content),
      };
    });

    res.json(summaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get priority report
app.get('/api/priority-report', (req, res) => {
  try {
    const reportPath = path.join(TRAIL_DIR, 'priority-report.md');
    if (!fs.existsSync(reportPath)) return res.status(404).json({ error: 'No priority report' });

    const content = fs.readFileSync(reportPath, 'utf-8');
    res.json({ markdown: content, html: marked(content) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Trail UI running at http://localhost:${PORT}`);
});
