/* ------------------ Data ------------------ */
const risks = [
  { no: 1, title: 'Plain-language disclaimers (“I’m an AI, not a therapist”)', description: 'Builds trust, reduces liability from misperception', mitigation: 'Copywriter + product team', initialRisk: 'High',    owner: 'Product',  due: '2025-10-20' },
  { no: 2, title: 'Step-through consent modal (checkboxes for role, age, TOS)', description: 'Legal protection, clear user expectation',           mitigation: 'Designer + frontend dev',          initialRisk: 'Medium',  owner: 'Frontend', due: '2025-10-25' },
  { no: 3, title: 'Persistent “Need Help Now?” footer with hotlines',           description: 'Meets WHO safety guidelines, saves lives',            mitigation: 'Dev for integration + hotline partner', initialRisk: 'Critical', owner: 'Platform', due: '2025-10-18' },
  { no: 4, title: 'Message-tone style guide (ban words like “cure”)',           description: 'Prevents legal/reputation risks from affiliates',     mitigation: 'Content lead, 1-day workshop',    initialRisk: 'Medium',  owner: 'Content',  due: '2025-10-28' },
  { no: 5, title: 'Advisory Board page (bios + cadence)',                       description: 'Adds legitimacy for partners & investors',            mitigation: 'Ops/admin support + basic web update', initialRisk: 'Low',     owner: 'Ops',      due: '2025-11-01' }
];

let currentIndex = 0;
let feedbackCache = {};              // { [riskTitle]: HTML string (from rich editor via hidden textarea) }
let riskStatusCache = {};            // { [riskTitle]: "implemented"|"planned"|"not_planned"|"discussion" }
let finishedConfirmed = false;

/* ---------- Status picker config ---------- */
const STATUS_OPTIONS = [
  { key: "implemented", label: "Already Implemented", emoji: "✅", css: "status-implemented" },
  { key: "planned",      label: "Planned",            emoji: "🧭", css: "status-planned" },
  { key: "not_planned",  label: "Not Planned",        emoji: "❌", css: "status-notplanned" },
  { key: "discussion",   label: "Needs Discussion",   emoji: "❓", css: "status-discuss" }
];

function statusLabel(key) {
  const found = STATUS_OPTIONS.find(o => o.key === key);
  return found ? found.label : "—";
}

/* ---------- Tabs + Table helpers ---------- */
function refreshTabs() {
  if (typeof window.renderRiskTabs === 'function') {
    window.renderRiskTabs(risks.map(r => r.title));
  }
}

function updateTableView() {
  if (typeof window.renderRiskTable !== 'function') return;
  const rows = risks.map((r, i) => ({
    index: i,
    title: r.title,
    description: r.description,
    initialRisk: r.initialRisk,
    status: statusLabel(riskStatusCache[r.title]),
    mitigation: r.mitigation,
    feedbackHtml: feedbackCache[r.title] || "",
    owner: r.owner || '—',
    due: r.due || '—'
  }));
  window.renderRiskTable(rows);
}

/* ---------- Sidebar (left list) ---------- */
function updateRiskSelector() {
  const container = document.getElementById("risk-selector");
  if (!container) return;
  container.innerHTML = "";

  risks.forEach((risk, index) => {
    const hasFeedback = (feedbackCache[risk.title] || "").trim().length > 0;
    const hasStatus = !!riskStatusCache[risk.title];
    const dotColor = (hasFeedback || hasStatus) ? "green" : "red";

    const item = document.createElement("div");
    item.className = "risk-selector-item" + (index === currentIndex ? " active" : "");
    item.innerHTML = `<span class="dot" style="background:${dotColor}"></span>${risk.no}. ${risk.title}`;

    item.onclick = () => {
      saveCurrentFeedback();
      currentIndex = index;
      renderRisk(currentIndex);
    };

    container.appendChild(item);
  });
}

/* ---------- Progress bar + CTA logic ---------- */
function updateProgress() {
  const total = risks.length;
  const filled = Object.values(feedbackCache).filter(t => t && t.length > 0).length;
  const percent = Math.round((filled / total) * 100);

  const pText = document.getElementById("progress-text");
  const pFill = document.getElementById("progress-fill");
  if (pText) pText.textContent = `Progress: ${filled}/${total} (${percent}%)`;
  if (pFill) pFill.style.width = `${percent}%`;

  const finishedBtn = document.getElementById("finished-btn");
  const submitBtn = document.getElementById("submit-btn");

  if (finishedBtn && submitBtn) {
    if (filled === total && !finishedConfirmed) {
      finishedBtn.style.display = "inline-block";
      submitBtn.style.display = "none";
    } else if (finishedConfirmed) {
      finishedBtn.style.display = "none";
      submitBtn.style.display = "inline-block";
      submitBtn.disabled = false;
    } else {
      finishedBtn.style.display = "none";
      submitBtn.style.display = "none";
    }
  }

  updateRiskSelector();
  updateTableView();
}

/* ---------- Save text feedback (grabs HTML from hidden textarea) ---------- */
function saveCurrentFeedback() {
  const textarea = document.getElementById("feedback");
  if (!textarea) return;
  feedbackCache[risks[currentIndex].title] = (textarea.value || "").trim();
  updateProgress();
}

/* ---------- Render status buttons for the current risk ---------- */
function renderStatusFor(index) {
  const container = document.getElementById("status-group");
  if (!container) return;
  container.innerHTML = "";

  const title = risks[index].title;
  const current = riskStatusCache[title] || null;

  STATUS_OPTIONS.forEach(opt => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `status-btn ${opt.css}` + (current === opt.key ? " selected" : "");
    btn.dataset.statusKey = opt.key;
    btn.innerHTML = `<span class="emoji">${opt.emoji}</span> ${opt.label}`;
    btn.onclick = () => {
      riskStatusCache[title] = opt.key; // single-select
      renderStatusFor(index);           // refresh selection styles
      updateTableView();                // reflect in table view immediately
      updateRiskSelector();             // dot turns green when status chosen
    };
    container.appendChild(btn);
  });
}

/* ---------- Render the current card ---------- */
function renderRisk(index) {
  const risk = risks[index];

  const t = document.getElementById("risk-title");
  const d = document.getElementById("risk-description");
  const m = document.getElementById("mitigation-description");
  const f = document.getElementById("feedback");

  if (t) t.textContent = `${risk.no}. ${risk.title}`;
  if (d) d.textContent = risk.description;
  if (m) m.textContent = risk.mitigation;

  // set Initial Risk / Owner / Due badges (from the HTML helpers)
  if (typeof window.setInitialRisk === 'function') window.setInitialRisk(risk.initialRisk);
  if (typeof window.setRiskOwner === 'function') window.setRiskOwner(risk.owner || '—');
  if (typeof window.setRiskDue === 'function') window.setRiskDue(risk.due || '—');

  // status buttons above the editor
  renderStatusFor(index);

  // restore feedback into the editor (hidden textarea already mirrors the editor HTML)
  if (f) f.value = feedbackCache[risk.title] || "";

  // enable/disable nav
  const prev = document.getElementById("prev-btn");
  const next = document.getElementById("next-btn");
  if (prev) prev.disabled = index === 0;
  if (next) next.disabled = index === risks.length - 1;

  // sync any external listeners
  window.dispatchEvent(new CustomEvent('riskIndexChanged', { detail: { index } }));

  updateProgress();
}

/* ---------- Nav buttons ---------- */
const prevBtn = document.getElementById("prev-btn");
if (prevBtn) {
  prevBtn.onclick = () => {
    saveCurrentFeedback();
    if (currentIndex > 0) {
      currentIndex--;
      renderRisk(currentIndex);
    }
  };
}

const nextBtn = document.getElementById("next-btn");
if (nextBtn) {
  nextBtn.onclick = () => {
    saveCurrentFeedback();
    if (currentIndex < risks.length - 1) {
      currentIndex++;
      renderRisk(currentIndex);
    }
  };
}

const finishedBtn = document.getElementById("finished-btn");
if (finishedBtn) {
  finishedBtn.onclick = () => {
    finishedConfirmed = true;
    updateProgress();
  };
}

/* ---------- Submit all entries ---------- */
const submitBtn = document.getElementById("submit-btn");
if (submitBtn) {
  submitBtn.onclick = async () => {
    saveCurrentFeedback();

    const allEntries = risks.map(risk => ({
      risk_no: risk.no,
      risk_title: risk.title,
      feedback_html: feedbackCache[risk.title] || "",
      status: riskStatusCache[risk.title] || null,
      initial_risk: risk.initialRisk ?? null,
      owner: risk.owner ?? null,
      due: risk.due ?? null
    }));

    const response = await fetch(
      "https://rusdxiqbcbkqvqnctbrz.supabase.co/rest/v1/feedback",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey":
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1c2R4aXFiY2JrcXZxbmN0YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzM2MDUsImV4cCI6MjA3MDE0OTYwNX0.Y1QmIhR3Hl_taG6OshmMclyVmqo7oFVJtBmsNFiWmhU",
          "Authorization":
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1c2R4aXFiY2JrcXZxbmN0YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzM2MDUsImV4cCI6MjA3MDE0OTYwNX0.Y1QmIhR3Hl_taG6OshmMclyVmqo7oFVJtBmsNFiWmhU",
          Prefer: "return=minimal"
        },
        body: JSON.stringify(allEntries)
      }
    );

    if (response.ok) {
      // swap to thank-you screen with summary (including status + initial risk)
      const main = document.querySelector("main");
      if (main) main.style.display = "none";
      const ty = document.getElementById("thank-you-screen");
      if (ty) ty.style.display = "block";

      const summaryDiv = document.getElementById("response-summary");
      if (summaryDiv) {
        summaryDiv.innerHTML = risks
          .map(risk => {
            const fb = (feedbackCache[risk.title] || "—").trim() || "—";
            const st = statusLabel(riskStatusCache[risk.title]);
            const ir = risk.initialRisk ?? '—';
            const owner = risk.owner ?? '—';
            const due = risk.due ?? '—';
            return `
              <div style="margin-bottom: 1.25em;">
                <strong>${risk.no}. ${risk.title}</strong><br/>
                <small><b>Initial Risk:</b> ${ir} &nbsp;|&nbsp; <b>Status:</b> ${st} &nbsp;|&nbsp; <b>Owner:</b> ${owner} &nbsp;|&nbsp; <b>Due:</b> ${due}</small><br/>
                <em>${fb}</em>
              </div>`;
          })
          .join("");
      }
    } else {
      alert("❌ Error submitting feedback.");
      console.error(await response.text());
    }
  };
}

/* ---------- Collapsible sidebar ---------- */
(function setupCollapsibleSidebar() {
  const btn = document.getElementById("toggleSidebar");
  const STORAGE_KEY = "riskSidebarCollapsed";

  function setCollapsed(collapsed) {
    document.body.classList.toggle("sidebar-collapsed", collapsed);
    if (btn) {
      btn.setAttribute("aria-expanded", (!collapsed).toString());
      btn.title = collapsed ? "Show list (Ctrl/Cmd + \\)" : "Hide list (Ctrl/Cmd + \\)";
      btn.textContent = collapsed ? "☰ Show List" : "☰ Hide List";
    }
    try { localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0"); } catch {}
  }

  function getInitialState() {
    // default: expanded; respect previous preference if present
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "1" || v === "0") return v === "1";
    } catch {}
    return false;
  }

  const initialCollapsed = getInitialState();
  setCollapsed(initialCollapsed);

  if (btn) {
    btn.addEventListener("click", () => setCollapsed(!document.body.classList.contains("sidebar-collapsed")));
  }

  // Keyboard shortcut: Cmd/Ctrl + \
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
      e.preventDefault();
      setCollapsed(!document.body.classList.contains("sidebar-collapsed"));
    }
  });
})();

/* ---------- Init ---------- */
refreshTabs();       // build any tabs if you still use them
renderRisk(currentIndex);

// keep cache updated as user types (textarea mirrors rich editor HTML)
const feedbackEl = document.getElementById("feedback");
if (feedbackEl) feedbackEl.addEventListener("keyup", saveCurrentFeedback);

// initial table render (table view uses this)
updateTableView();
