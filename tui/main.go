package main

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"unicode/utf8"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/glamour"
	"github.com/charmbracelet/lipgloss"
)

var (
	trailDir string

	cRed   = lipgloss.Color("#e94560")
	cGreen = lipgloss.Color("#4ecca3")
	cDim   = lipgloss.Color("#666")
	cBg    = lipgloss.Color("#1a1a2e")
	cBorder = lipgloss.Color("#2a2a4a")
	cFocus  = lipgloss.Color("#4ecca3")
)

type trail struct {
	slug    string
	title   string
	status  string
	entries []entry
}

type entry struct {
	filename string
	title    string
	markdown string
}

type pane int

const (
	paneTrails pane = iota
	paneFiles
	paneDetail
)

type model struct {
	trails       []trail
	trailCursor  int
	fileCursor   int
	activPane    pane
	width        int
	height       int
	detailScroll int
	trailScroll  int
	fileScroll   int
	filter       string
	filtering    bool
	filtered     []int
}

func loadTrails() []trail {
	entries, err := os.ReadDir(trailDir)
	if err != nil {
		return nil
	}

	var trails []trail
	for _, e := range entries {
		if !e.IsDir() || e.Name() == "archive" || e.Name() == ".git" {
			continue
		}
		t := trail{slug: e.Name()}

		thPath := filepath.Join(trailDir, e.Name(), "00-trailhead.md")
		if data, err := os.ReadFile(thPath); err == nil {
			content := string(data)
			for _, line := range strings.Split(content, "\n") {
				if strings.HasPrefix(line, "# ") {
					t.title = strings.TrimPrefix(line, "# ")
				}
				if strings.Contains(line, "**Status:**") {
					parts := strings.SplitN(line, "**Status:**", 2)
					if len(parts) == 2 {
						t.status = strings.TrimSpace(parts[1])
					}
				}
			}
		}
		if t.title == "" {
			t.title = e.Name()
		}

		files, _ := os.ReadDir(filepath.Join(trailDir, e.Name()))
		for _, f := range files {
			if !strings.HasSuffix(f.Name(), ".md") {
				continue
			}
			en := entry{filename: f.Name()}
			if data, err := os.ReadFile(filepath.Join(trailDir, e.Name(), f.Name())); err == nil {
				en.markdown = string(data)
				for _, line := range strings.Split(en.markdown, "\n") {
					if strings.HasPrefix(line, "# ") {
						en.title = strings.TrimPrefix(line, "# ")
						break
					}
				}
			}
			if en.title == "" {
				en.title = strings.TrimSuffix(f.Name(), ".md")
			}
			t.entries = append(t.entries, en)
		}

		trails = append(trails, t)
	}

	sort.Slice(trails, func(i, j int) bool {
		return trails[i].slug > trails[j].slug
	})

	return trails
}

func initialModel() model {
	trails := loadTrails()
	m := model{
		trails:    trails,
		activPane: paneTrails,
	}
	m.resetFilter()
	return m
}

func (m *model) resetFilter() {
	m.filtered = make([]int, len(m.trails))
	for i := range m.trails {
		m.filtered[i] = i
	}
}

func (m *model) applyFilter() {
	if m.filter == "" {
		m.resetFilter()
		return
	}
	q := strings.ToLower(m.filter)
	m.filtered = nil
	for i, t := range m.trails {
		if strings.Contains(strings.ToLower(t.title), q) || strings.Contains(strings.ToLower(t.slug), q) {
			m.filtered = append(m.filtered, i)
		}
	}
	if m.trailCursor >= len(m.filtered) {
		m.trailCursor = maxInt(0, len(m.filtered)-1)
	}
}

func (m *model) selectedTrail() *trail {
	if len(m.filtered) == 0 || m.trailCursor >= len(m.filtered) {
		return nil
	}
	return &m.trails[m.filtered[m.trailCursor]]
}

func (m model) Init() tea.Cmd {
	return nil
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		return m, nil

	case tea.KeyMsg:
		if m.filtering {
			switch msg.Type {
			case tea.KeyEscape:
				m.filtering = false
				m.filter = ""
				m.resetFilter()
			case tea.KeyEnter:
				m.filtering = false
			case tea.KeyBackspace:
				if len(m.filter) > 0 {
					m.filter = m.filter[:len(m.filter)-1]
					m.applyFilter()
				}
			default:
				if msg.Type == tea.KeyRunes {
					m.filter += string(msg.Runes)
					m.applyFilter()
				}
			}
			return m, nil
		}

		switch msg.String() {
		case "q", "ctrl+c":
			return m, tea.Quit
		case "/":
			m.filtering = true
			m.filter = ""
			return m, nil
		case "tab":
			switch m.activPane {
			case paneTrails:
				if m.selectedTrail() != nil {
					m.activPane = paneFiles
				}
			case paneFiles:
				m.activPane = paneDetail
			case paneDetail:
				m.activPane = paneTrails
			}
		case "shift+tab":
			switch m.activPane {
			case paneTrails:
				m.activPane = paneDetail
			case paneFiles:
				m.activPane = paneTrails
			case paneDetail:
				m.activPane = paneFiles
			}
		case "up", "k":
			switch m.activPane {
			case paneTrails:
				if m.trailCursor > 0 {
					m.trailCursor--
					m.fileCursor = 0
					m.fileScroll = 0
					m.detailScroll = 0
				}
			case paneFiles:
				if m.fileCursor > 0 {
					m.fileCursor--
					m.detailScroll = 0
				}
			case paneDetail:
				if m.detailScroll > 0 {
					m.detailScroll--
				}
			}
		case "down", "j":
			switch m.activPane {
			case paneTrails:
				if m.trailCursor < len(m.filtered)-1 {
					m.trailCursor++
					m.fileCursor = 0
					m.fileScroll = 0
					m.detailScroll = 0
				}
			case paneFiles:
				if t := m.selectedTrail(); t != nil {
					if m.fileCursor < len(t.entries)-1 {
						m.fileCursor++
						m.detailScroll = 0
					}
				}
			case paneDetail:
				m.detailScroll++
			}
		case "enter", "right", "l":
			switch m.activPane {
			case paneTrails:
				if m.selectedTrail() != nil {
					m.activPane = paneFiles
					m.fileCursor = 0
					m.fileScroll = 0
					m.detailScroll = 0
				}
			case paneFiles:
				m.activPane = paneDetail
				m.detailScroll = 0
			}
		case "esc", "left", "h":
			switch m.activPane {
			case paneFiles:
				m.activPane = paneTrails
			case paneDetail:
				m.activPane = paneFiles
			}
		}
	}
	return m, nil
}

// ── rendering helpers ──

// visibleLen returns the printed width of a string, ignoring ANSI escapes.
func visibleLen(s string) int {
	n := 0
	inEsc := false
	for _, r := range s {
		if r == '\033' {
			inEsc = true
			continue
		}
		if inEsc {
			if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || r == '~' {
				inEsc = false
			}
			continue
		}
		n++
	}
	return n
}

// padRight pads s to exactly `w` visible characters, truncating if needed.
func padRight(s string, w int) string {
	vl := visibleLen(s)
	if vl >= w {
		// truncate to w visible chars
		out := strings.Builder{}
		n := 0
		inEsc := false
		for _, r := range s {
			if r == '\033' {
				inEsc = true
				out.WriteRune(r)
				continue
			}
			if inEsc {
				out.WriteRune(r)
				if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || r == '~' {
					inEsc = false
				}
				continue
			}
			if n >= w {
				break
			}
			out.WriteRune(r)
			n++
		}
		// reset any dangling style
		out.WriteString("\033[0m")
		return out.String()
	}
	return s + strings.Repeat(" ", w-vl)
}

// makeColumn builds exactly `h` lines, each exactly `w` visible chars wide.
// `items` are the content lines, `offset` is the scroll start.
func makeColumn(items []string, offset, w, h int) []string {
	lines := make([]string, h)
	for i := 0; i < h; i++ {
		idx := offset + i
		if idx >= 0 && idx < len(items) {
			lines[i] = padRight(items[idx], w)
		} else {
			lines[i] = strings.Repeat(" ", w)
		}
	}
	return lines
}

// scrollToKeepVisible adjusts scroll so cursor is visible in `h` lines.
func scrollToKeepVisible(cursor, scroll, h int) int {
	if cursor < scroll {
		return cursor
	}
	if cursor >= scroll+h {
		return cursor - h + 1
	}
	return scroll
}

func (m model) View() string {
	if m.width < 10 || m.height < 5 {
		return "too small"
	}

	// Layout: 1 header + body rows + 1 help = height
	bodyH := m.height - 2
	if bodyH < 1 {
		bodyH = 1
	}

	// Column widths (content only, no borders)
	// Reserve 1 char between each column as separator = 2 separators
	available := m.width - 2
	col1W := available * 20 / 100
	col2W := available * 20 / 100
	col3W := available - col1W - col2W
	if col1W < 10 {
		col1W = 10
	}
	if col2W < 10 {
		col2W = 10
	}
	if col3W < 10 {
		col3W = 10
	}

	// ── Header ──
	headerText := "\033[1;38;5;197m TRAIL \033[0m"
	if m.filtering {
		headerText += fmt.Sprintf("\033[38;5;244m /%s▋\033[0m", m.filter)
	}

	// ── Column 1: Trails ──
	m.trailScroll = scrollToKeepVisible(m.trailCursor, m.trailScroll, bodyH)
	var trailItems []string
	for vi, fi := range m.filtered {
		t := m.trails[fi]
		text := truncate(t.slug, col1W-2)
		if vi == m.trailCursor {
			if m.activPane == paneTrails {
				// green bg, dark text
				trailItems = append(trailItems, fmt.Sprintf("\033[1;30;48;5;43m %s \033[0m", text))
			} else {
				// red text, bold
				trailItems = append(trailItems, fmt.Sprintf("\033[1;38;5;197m %s \033[0m", text))
			}
		} else {
			trailItems = append(trailItems, fmt.Sprintf("\033[38;5;244m %s \033[0m", text))
		}
	}
	col1Lines := makeColumn(trailItems, m.trailScroll, col1W, bodyH)

	// ── Column 2: Files ──
	m.fileScroll = scrollToKeepVisible(m.fileCursor, m.fileScroll, bodyH)
	var fileItems []string
	if t := m.selectedTrail(); t != nil {
		for i, e := range t.entries {
			text := truncate(e.filename, col2W-2)
			if i == m.fileCursor {
				if m.activPane == paneFiles {
					fileItems = append(fileItems, fmt.Sprintf("\033[1;30;48;5;43m %s \033[0m", text))
				} else {
					fileItems = append(fileItems, fmt.Sprintf("\033[1;38;5;197m %s \033[0m", text))
				}
			} else {
				fileItems = append(fileItems, fmt.Sprintf("\033[38;5;244m %s \033[0m", text))
			}
		}
	}
	col2Lines := makeColumn(fileItems, m.fileScroll, col2W, bodyH)

	// ── Column 3: Markdown ──
	var mdLines []string
	if t := m.selectedTrail(); t != nil && m.fileCursor < len(t.entries) {
		md := t.entries[m.fileCursor].markdown
		renderer, _ := glamour.NewTermRenderer(
			glamour.WithStandardStyle("dark"),
			glamour.WithWordWrap(col3W-2),
		)
		rendered := md
		if renderer != nil {
			if r, err := renderer.Render(md); err == nil {
				rendered = r
			}
		}
		// Split and flatten — glamour can embed \n in lines
		for _, line := range strings.Split(rendered, "\n") {
			mdLines = append(mdLines, " "+line)
		}
		// Clamp scroll
		maxScroll := len(mdLines) - bodyH
		if maxScroll < 0 {
			maxScroll = 0
		}
		if m.detailScroll > maxScroll {
			m.detailScroll = maxScroll
		}
	}
	col3Lines := makeColumn(mdLines, m.detailScroll, col3W, bodyH)

	// ── Separator char ──
	var sepChar string
	sepNormal := fmt.Sprintf("\033[38;5;238m│\033[0m")
	_ = sepNormal

	// ── Compose rows ──
	var buf strings.Builder
	buf.WriteString(headerText)
	buf.WriteByte('\n')

	for i := 0; i < bodyH; i++ {
		// Determine separator colors based on focus
		sep1 := sepNormal
		sep2 := sepNormal
		if m.activPane == paneTrails {
			sep1 = fmt.Sprintf("\033[38;5;43m│\033[0m")
		} else if m.activPane == paneFiles {
			sep1 = fmt.Sprintf("\033[38;5;43m│\033[0m")
			sep2 = fmt.Sprintf("\033[38;5;43m│\033[0m")
		} else if m.activPane == paneDetail {
			sep2 = fmt.Sprintf("\033[38;5;43m│\033[0m")
		}
		_ = sepChar

		buf.WriteString(col1Lines[i])
		buf.WriteString(sep1)
		buf.WriteString(col2Lines[i])
		buf.WriteString(sep2)
		buf.WriteString(col3Lines[i])
		if i < bodyH-1 {
			buf.WriteByte('\n')
		}
	}

	buf.WriteByte('\n')
	buf.WriteString("\033[38;5;244m ↑↓ navigate • →/enter right • ←/esc left • tab cycle • / filter • q quit\033[0m")

	return buf.String()
}

func truncate(s string, maxLen int) string {
	if maxLen < 1 {
		return ""
	}
	if utf8.RuneCountInString(s) <= maxLen {
		return s
	}
	if maxLen < 4 {
		runes := []rune(s)
		return string(runes[:maxLen])
	}
	runes := []rune(s)
	return string(runes[:maxLen-3]) + "..."
}

func maxInt(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func main() {
	trailDir = os.Getenv("TRAIL_DIR")
	if trailDir == "" {
		home, _ := os.UserHomeDir()
		trailDir = filepath.Join(home, "trail")
	}

	p := tea.NewProgram(initialModel(), tea.WithAltScreen())
	if _, err := p.Run(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}
