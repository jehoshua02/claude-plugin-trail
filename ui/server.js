const express = require('express');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const app = express();
const TRAIL_DIR = process.env.TRAIL_DIR || path.join(require('os').homedir(), 'trail');

app.use(express.static(path.join(__dirname, 'public')));

// List all trail topics
app.get('/api/trails', (req, res) => {
  try {
    const entries = fs.readdirSync(TRAIL_DIR, { withFileTypes: true });
    const trails = entries
      .filter(e => e.isDirectory() && e.name !== 'archive' && e.name !== '.git')
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

        return { slug: e.name, title, status, ticket, date, entryCount: files.length };
      })
      .sort((a, b) => b.slug.localeCompare(a.slug));

    res.json(trails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get archived trails
app.get('/api/trails/archived', (req, res) => {
  try {
    const archiveDir = path.join(TRAIL_DIR, 'archive');
    if (!fs.existsSync(archiveDir)) return res.json([]);

    const entries = fs.readdirSync(archiveDir, { withFileTypes: true });
    const trails = entries
      .filter(e => e.isDirectory())
      .map(e => {
        const trailheadPath = path.join(archiveDir, e.name, '00-trailhead.md');
        let title = e.name;
        let date = '';

        if (fs.existsSync(trailheadPath)) {
          const content = fs.readFileSync(trailheadPath, 'utf-8');
          const titleMatch = content.match(/^#\s+(.+)$/m);
          if (titleMatch) title = titleMatch[1];
          const dateMatch = content.match(/\*\*Date:\*\*\s*(.+)/);
          if (dateMatch) date = dateMatch[1].trim();
        }

        const files = fs.readdirSync(path.join(archiveDir, e.name))
          .filter(f => f.endsWith('.md'))
          .sort();

        return { slug: e.name, title, date, status: 'archived', entryCount: files.length, archived: true };
      })
      .sort((a, b) => b.slug.localeCompare(a.slug));

    res.json(trails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all entries for a trail
app.get('/api/trails/:slug', (req, res) => {
  try {
    let trailDir = path.join(TRAIL_DIR, req.params.slug);
    if (!fs.existsSync(trailDir)) {
      trailDir = path.join(TRAIL_DIR, 'archive', req.params.slug);
    }
    if (!fs.existsSync(trailDir)) return res.status(404).json({ error: 'Trail not found' });

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
