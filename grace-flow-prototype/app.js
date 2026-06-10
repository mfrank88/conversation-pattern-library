const SECTION_CONFIG = [
  { id: "flow-index", title: "Flow Index", marker: null, color: "#0f6b6f" },
  { id: "shared-rules", title: "Shared Rules", marker: "SHARED RULES", color: "#26784f" },
  { id: "verify", title: "Verify Appointment", marker: "VERIFY APPOINTMENT FLOW", color: "#355fa3" },
  { id: "cancel", title: "Cancel Appointment", marker: "CANCEL APPOINTMENT FLOW", color: "#c85738" },
  { id: "schedule", title: "Schedule Appointment", marker: "SCHEDULE APPOINTMENT FLOW", color: "#af7900" },
  { id: "reschedule", title: "Reschedule Appointment", marker: "RESCHEDULE APPOINTMENT FLOW", color: "#0f6b6f" },
  { id: "sms", title: "SMS Spec", marker: "SMS SPEC", color: "#c85738" },
  { id: "open-items", title: "Open Items", marker: "Open Items", color: "#af7900" },
  { id: "corrections", title: "Corrections", marker: "Corrections Applied In This Library", color: "#26784f" },
];

const FLOW_IDS = ["verify", "cancel", "schedule", "reschedule"];
const FLOW_ROUTES = [
  ["Verify", "Schedule", "No upcoming appointment"],
  ["Cancel", "Reschedule", "Appointment in scheduling scope"],
  ["Cancel", "Schedule", "No upcoming appointment"],
  ["Reschedule", "Schedule", "No appointment in 90 days"],
  ["Any flow", "Care Navigator", "Out of scope or failed auth"],
];

let sections = [];
let activeSectionId = "flow-index";
let searchTerm = "";

const elements = {
  nav: document.querySelector("#sectionNav"),
  overview: document.querySelector("#overview"),
  content: document.querySelector("#content"),
  outline: document.querySelector("#outline"),
  title: document.querySelector("#sectionTitle"),
  kicker: document.querySelector("#sectionKicker"),
  search: document.querySelector("#searchInput"),
  copy: document.querySelector("#copyButton"),
  overviewButton: document.querySelector("#overviewButton"),
  toast: document.querySelector("#toast"),
};

init();

async function init() {
  try {
    const response = await fetch("./data/grace-flow-library.txt", { cache: "no-store" });
    const source = await response.text();
    sections = buildSections(source);
    render();
  } catch (error) {
    elements.content.innerHTML = `<div class="empty-state"><h3>Source file not found</h3><p>Check that data/grace-flow-library.txt is present beside the prototype files.</p></div>`;
  }

  elements.search.addEventListener("input", (event) => {
    searchTerm = event.target.value.trim();
    render();
  });

  elements.copy.addEventListener("click", copyActiveSection);
  elements.overviewButton.addEventListener("click", () => {
    activeSectionId = "flow-index";
    searchTerm = "";
    elements.search.value = "";
    render();
  });
}

function buildSections(source) {
  const cleanSource = source.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const markers = SECTION_CONFIG.filter((section) => section.marker);
  const markerPositions = markers
    .map((section) => {
      const index = cleanSource.indexOf(section.marker);
      return { ...section, index };
    })
    .filter((section) => section.index >= 0)
    .sort((a, b) => a.index - b.index);

  const built = [];
  const firstMarkerIndex = markerPositions[0]?.index ?? cleanSource.length;
  built.push({
    ...SECTION_CONFIG[0],
    text: cleanSource.slice(0, firstMarkerIndex).trim(),
  });

  markerPositions.forEach((section, position) => {
    const next = markerPositions[position + 1];
    built.push({
      ...section,
      text: cleanSource.slice(section.index, next ? next.index : cleanSource.length).trim(),
    });
  });

  return built.map((section) => ({
    ...section,
    blocks: buildBlocks(section.text),
  }));
}

function buildBlocks(sectionText) {
  const lines = sectionText.split("\n").map((line) => line.trimEnd());
  const blocks = [];
  let current = null;

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return;
    }

    if (isDivider(trimmed)) {
      flushBlock();
      blocks.push({ title: "Divider", type: "divider", lines: [] });
      return;
    }

    if (isBlockTitle(trimmed)) {
      flushBlock();
      current = {
        title: trimmed,
        type: getBlockType(trimmed),
        lines: [],
      };
      return;
    }

    if (!current) {
      current = {
        title: "Overview",
        type: "summary",
        lines: [],
      };
    }

    current.lines.push(trimmed);
  });

  flushBlock();
  return blocks.filter((block) => block.type !== "divider" || blocks.length > 1);

  function flushBlock() {
    if (current) {
      blocks.push(current);
      current = null;
    }
  }
}

function isDivider(line) {
  return /^_{5,}$/.test(line);
}

function isBlockTitle(line) {
  return (
    /^STEP\s+[A-Z0-9-]+/.test(line) ||
    /^DECISION\s+[A-Z0-9-]+/.test(line) ||
    line === "SUMMARY" ||
    line === "DIALOGUE STANDARDS" ||
    line === "END" ||
    /^[A-Z-]+ END:/.test(line) ||
    /SMS$/.test(line) ||
    /^(Shared Rules|Format Conventions|Long-Content Fallback|Send Failure Handling|Voice offer:|Message \d|Message 2 fallback:|Message template:|Example:|Verbal fallback:|Multi-appointment Verify:)$/.test(line) ||
    /^(Voice And Tone|Standard Openings|Authentication|Proxy Caller Or Patient Switch|Global Escalation|Closing Check|Survey Eligibility|Transfer And After-Hours End States|Emergency Handling)$/.test(line)
  );
}

function getBlockType(title) {
  if (/^DECISION/.test(title)) return "decision";
  if (/^STEP/.test(title)) return "step";
  if (/SMS$|Message|Voice offer|Verbal fallback|Example/.test(title)) return "sms";
  if (/END/.test(title)) return "end";
  if (/DIALOGUE|Opening|Sample dialogue/.test(title)) return "dialogue";
  if (/SUMMARY|Rules|Standards|Handling|Eligibility|Authentication/.test(title)) return "summary";
  return "plain";
}

function render() {
  if (!sections.length) return;
  renderNav();
  renderOverview();

  if (searchTerm) {
    renderSearchResults();
    return;
  }

  const section = getActiveSection();
  elements.title.textContent = section.title;
  elements.kicker.textContent = "Section";
  elements.content.innerHTML = renderSection(section);
  elements.outline.innerHTML = renderOutline(section);
}

function renderNav() {
  elements.nav.innerHTML = sections
    .map((section) => {
      const stats = getSectionStats(section);
      const active = section.id === activeSectionId ? " active" : "";
      return `
        <button class="nav-button${active}" type="button" data-section-id="${section.id}">
          <span class="nav-dot" style="background:${section.color}" aria-hidden="true"></span>
          <span class="nav-title">${escapeHtml(section.title)}</span>
          <span class="nav-count">${stats.steps + stats.decisions}</span>
        </button>
      `;
    })
    .join("");

  elements.nav.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      activeSectionId = button.dataset.sectionId;
      searchTerm = "";
      elements.search.value = "";
      render();
    });
  });
}

function renderOverview() {
  const flowTiles = sections
    .filter((section) => FLOW_IDS.includes(section.id))
    .map((section) => {
      const stats = getSectionStats(section);
      return `
        <article class="flow-tile" data-section-id="${section.id}">
          <div>
            <strong>${escapeHtml(section.title)}</strong>
            <span>${stats.steps} steps, ${stats.decisions} decisions, ${stats.ends} end states</span>
          </div>
        </article>
      `;
    })
    .join("");

  const totals = getTotals();
  elements.overview.innerHTML = `
    <div class="route-map">${flowTiles}</div>
    <div class="metric-grid">
      <article class="metric-tile"><strong>${totals.sections}</strong><span>sections</span></article>
      <article class="metric-tile"><strong>${totals.steps}</strong><span>steps</span></article>
      <article class="metric-tile"><strong>${totals.decisions}</strong><span>decisions</span></article>
      <article class="metric-tile"><strong>${totals.authBlocks}</strong><span>auth retry sets</span></article>
    </div>
    <a class="standards-card" href="https://helix.ascension.org/6e5694746/p/116b76-conversation-design" target="_blank" rel="noopener noreferrer">
      <span class="standards-label">Helix Design System</span>
      <strong>Conversation Design Standards</strong>
      <span>Use the Helix standards when reviewing Grace copy, branching, errors and tone.</span>
    </a>
  `;

  elements.overview.querySelectorAll(".flow-tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      activeSectionId = tile.dataset.sectionId;
      render();
    });
  });
}

function renderSection(section) {
  const stats = getSectionStats(section);
  const routeChips = FLOW_ROUTES
    .filter(([from, to]) => section.title.includes(from) || from === "Any flow" || section.title.includes(to))
    .slice(0, 4)
    .map(([from, to, reason]) => `<span class="tag">${escapeHtml(from)} to ${escapeHtml(to)}: ${escapeHtml(reason)}</span>`)
    .join("");

  return `
    <div class="section-summary">
      <h3>${escapeHtml(section.title)}</h3>
      <div class="summary-tags">
        <span class="tag">${stats.steps} steps</span>
        <span class="tag">${stats.decisions} decisions</span>
        <span class="tag">${stats.ends} end states</span>
        ${routeChips}
      </div>
    </div>
    ${section.blocks.map((block, index) => renderBlock(block, index)).join("")}
  `;
}

function renderBlock(block, index) {
  if (block.type === "divider") {
    return `<div class="divider-line"></div>`;
  }

  const id = `block-${index}`;
  const type = block.type === "plain" ? "note" : block.type;
  return `
    <article id="${id}" class="block ${block.type}">
      <div class="block-title-row">
        <h3>${highlight(escapeHtml(block.title))}</h3>
        <span class="block-type">${escapeHtml(type)}</span>
      </div>
      <div class="block-body">${renderLines(block.lines)}</div>
    </article>
  `;
}

function renderLines(lines) {
  const chunks = [];
  let list = [];

  lines.forEach((line) => {
    if (line.startsWith("* ")) {
      list.push(line.slice(2));
      return;
    }

    flushList();
    const className = /^".*"$/.test(line) || line.includes("Sample dialogue:") ? "quote-line" : "plain-line";
    chunks.push(`<p class="${className}">${highlight(escapeHtml(line))}</p>`);
  });

  flushList();
  return chunks.join("");

  function flushList() {
    if (!list.length) return;
    chunks.push(`<ul>${list.map((item) => `<li>${highlight(escapeHtml(item))}</li>`).join("")}</ul>`);
    list = [];
  }
}

function renderOutline(section) {
  const links = section.blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block.type !== "divider")
    .slice(0, 36)
    .map(({ block, index }) => `<a href="#block-${index}">${escapeHtml(block.title)}</a>`)
    .join("");

  return `<h3>${escapeHtml(section.title)}</h3>${links || "<p>No outline items.</p>"}`;
}

function renderSearchResults() {
  const query = searchTerm.toLowerCase();
  const matches = sections
    .map((section) => ({
      section,
      blocks: section.blocks.filter((block) => `${block.title}\n${block.lines.join("\n")}`.toLowerCase().includes(query)),
    }))
    .filter((item) => item.blocks.length);

  elements.title.textContent = "Search Results";
  elements.kicker.textContent = `${matches.reduce((total, item) => total + item.blocks.length, 0)} matches`;
  elements.overview.innerHTML = "";
  elements.outline.innerHTML = "";

  if (!matches.length) {
    elements.content.innerHTML = `<div class="empty-state"><h3>No matches</h3><p>Try a shorter phrase.</p></div>`;
    return;
  }

  elements.content.innerHTML = matches
    .map(({ section, blocks }) => {
      return `
        <div class="section-summary">
          <h3>${escapeHtml(section.title)}</h3>
          <div class="summary-tags"><span class="tag">${blocks.length} matches</span></div>
        </div>
        ${blocks.map((block, index) => renderBlock(block, index)).join("")}
      `;
    })
    .join("");
}

function getSectionStats(section) {
  const text = section.text;
  return {
    steps: countMatches(text, /^STEP\s+/gm),
    decisions: countMatches(text, /^DECISION\s+/gm),
    ends: countMatches(text, /\bEND\b/gm),
    authBlocks: countMatches(text, /^STEP 2B - First authentication retry/gm),
  };
}

function getTotals() {
  return sections.reduce(
    (totals, section) => {
      const stats = getSectionStats(section);
      totals.sections += 1;
      totals.steps += stats.steps;
      totals.decisions += stats.decisions;
      totals.ends += stats.ends;
      totals.authBlocks += stats.authBlocks;
      return totals;
    },
    { sections: 0, steps: 0, decisions: 0, ends: 0, authBlocks: 0 }
  );
}

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function getActiveSection() {
  return sections.find((section) => section.id === activeSectionId) || sections[0];
}

function copyActiveSection() {
  const section = getActiveSection();
  navigator.clipboard
    .writeText(section.text)
    .then(() => showToast("Section copied"))
    .catch(() => showToast("Copy failed"));
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  setTimeout(() => elements.toast.classList.remove("visible"), 1800);
}

function highlight(text) {
  if (!searchTerm) return text;
  const safeTerm = escapeRegExp(searchTerm);
  return text.replace(new RegExp(`(${safeTerm})`, "gi"), "<mark>$1</mark>");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
