const risks = [
  {
    title: "Policy / Legal Risk",
    description:
      "The system may inadvertently violate current or emerging regulations, including data sovereignty, export control, or misuse liability laws. Unclear accountability across jurisdictions can also lead to enforcement challenges.",
    mitigation:
      "Review deployment plans with legal counsel. Implement audit trails, regulatory impact assessments, and dynamic compliance mapping to evolving global standards."
  },
  {
    title: "Technical Risk",
    description:
      "The system may behave unpredictably in edge cases or under adversarial inputs. Failures in logic, memory leakage, or model hallucination could lead to unacceptable performance in safety-critical settings.",
    mitigation:
      "Enforce rigorous testing, use formal verification where applicable, implement runtime monitoring, and limit operational domains using safety envelopes."
  },
  {
    title: "Data Risk",
    description:
      "Biased, incomplete, or unverified training data may introduce systemic flaws in model behavior. Data poisoning or drift can degrade performance over time.",
    mitigation:
      "Adopt strict data provenance tracking, establish validation pipelines, use differential privacy where necessary, and retrain with curated datasets periodically."
  },
  {
    title: "Medical Risk",
    description:
      "Incorrect model output or poor UX design in a healthcare context could result in delayed diagnosis, treatment errors, or patient harm.",
    mitigation:
      "Implement human-in-the-loop decision systems, validate outputs with clinicians, and comply with FDA, MDR, or equivalent regulatory frameworks."
  },
  {
    title: "Societal Risk",
    description:
      "The system may reinforce harmful stereotypes, reduce employment, or concentrate decision-making power, thereby amplifying inequality or eroding trust.",
    mitigation:
      "Engage with external stakeholders during development, conduct fairness audits, publish model cards and socioeconomic impact assessments."
  },
  {
    title: "Environmental Risk",
    description:
      "Training and deploying large models consumes significant energy and may contribute to carbon emissions, especially when operating at scale.",
    mitigation:
      "Use green energy where possible, optimize model efficiency, and track lifecycle emissions using industry frameworks such as ML CO2 Impact."
  }
];

let currentIndex = 0;
let feedbackCache = {};              // { [riskTitle]: string }
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

/* ---------- Sidebar (left list) ---------- */
function updateRiskSelector() {
  const container = document.getElementById("risk-selector");
  if (!container) return;
  container.innerHTML = "";

  risks.forEach((risk, index) => {
    const filled = (feedbackCache[risk.title] || "").trim().length > 0;
    const dotColor = filled ? "green" : "red";

    const item = document.createElement("div");
    item.className = "risk-selector-item" + (index === currentIndex ? " active" : "");
    item.innerHTML = `<span class="dot" style="background:${dotColor}"></span>${risk.title}`;

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
}

/* ---------- Save text feedback ---------- */
function saveCurrentFeedback() {
  const textarea = document.getElementById("feedback");
  if (!textarea) return;
  feedbackCache[risks[currentIndex].title] = textarea.value.trim();
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

  if (t) t.textContent = risk.title;
  if (d) d.textContent = risk.description;
  if (m) m.textContent = risk.mitigation;

  // status buttons above the textarea
  renderStatusFor(index);

  if (f) f.value = feedbackCache[risk.title] || "";

  const prev = document.getElementById("prev-btn");
  const next = document.getElementById("next-btn");
  if (prev) prev.disabled = index === 0;
  if (next) next.disabled = index === risks.length - 1;

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
      risk_title: risk.title,
      feedback_text: feedbackCache[risk.title] || "",
      // NOTE: status is not stored in Supabase yet; add a column + include below if you want it persisted:
      // status: riskStatusCache[risk.title] || null
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
      // swap to thank-you screen with summary (including status)
      const main = document.querySelector("main");
      if (main) main.style.display = "none";
      const ty = document.getElementById("thank-you-screen");
      if (ty) ty.style.display = "block";

      const summaryDiv = document.getElementById("response-summary");
      if (summaryDiv) {
        summaryDiv.innerHTML = risks
          .map(risk => {
            const fb = feedbackCache[risk.title] || "—";
            const st = statusLabel(riskStatusCache[risk.title]);
            return `
              <div style="margin-bottom: 1.25em;">
                <strong>${risk.title}</strong><br/>
                <small><b>Status:</b> ${st}</small><br/>
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

/* ---------- Mobile sidebar toggle (safe if missing) ---------- */
const sidebarToggle = document.getElementById("toggleSidebar");
if (sidebarToggle) {
  sidebarToggle.addEventListener("click", () => {
    const selector = document.getElementById("risk-selector");
    if (selector) selector.classList.toggle("open");
  });
}

const sidebar = document.getElementById("risk-sidebar");
const toggleButton = document.getElementById("toggle-sidebar");
if (sidebar && toggleButton) {
  toggleButton.onclick = () => {
    sidebar.classList.toggle("closed");
    sidebar.classList.toggle("open");
  };
}

/* ---------- Init ---------- */
renderRisk(currentIndex);
const feedbackEl = document.getElementById("feedback");
if (feedbackEl) feedbackEl.addEventListener("keyup", saveCurrentFeedback);
