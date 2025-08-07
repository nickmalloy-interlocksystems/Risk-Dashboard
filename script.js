const risks = [
  {
    title: "Policy / Legal Risk",
    description: "The system may inadvertently violate current or emerging regulations, including data sovereignty, export control, or misuse liability laws. Unclear accountability across jurisdictions can also lead to enforcement challenges.",
    mitigation: "Review deployment plans with legal counsel. Implement audit trails, regulatory impact assessments, and dynamic compliance mapping to evolving global standards."
  },
  {
    title: "Technical Risk",
    description: "The system may behave unpredictably in edge cases or under adversarial inputs. Failures in logic, memory leakage, or model hallucination could lead to unacceptable performance in safety-critical settings.",
    mitigation: "Enforce rigorous testing, use formal verification where applicable, implement runtime monitoring, and limit operational domains using safety envelopes."
  },
  {
    title: "Data Risk",
    description: "Biased, incomplete, or unverified training data may introduce systemic flaws in model behavior. Data poisoning or drift can degrade performance over time.",
    mitigation: "Adopt strict data provenance tracking, establish validation pipelines, use differential privacy where necessary, and retrain with curated datasets periodically."
  },
  {
    title: "Medical Risk",
    description: "Incorrect model output or poor UX design in a healthcare context could result in delayed diagnosis, treatment errors, or patient harm.",
    mitigation: "Implement human-in-the-loop decision systems, validate outputs with clinicians, and comply with FDA, MDR, or equivalent regulatory frameworks."
  },
  {
    title: "Societal Risk",
    description: "The system may reinforce harmful stereotypes, reduce employment, or concentrate decision-making power, thereby amplifying inequality or eroding trust.",
    mitigation: "Engage with external stakeholders during development, conduct fairness audits, publish model cards and socioeconomic impact assessments."
  },
  {
    title: "Environmental Risk",
    description: "Training and deploying large models consumes significant energy and may contribute to carbon emissions, especially when operating at scale.",
    mitigation: "Use green energy where possible, optimize model efficiency, and track lifecycle emissions using industry frameworks such as ML CO2 Impact."
  }
];

let currentIndex = 0;
let feedbackCache = {};
let finishedConfirmed = false;

function updateRiskSelector() {
  const container = document.getElementById("risk-selector");
  container.innerHTML = "";

  risks.forEach((risk, index) => {
    const filled = feedbackCache[risk.title]?.trim().length > 0;
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

function updateProgress() {
  const total = risks.length;
  const filled = Object.values(feedbackCache).filter(text => text && text.length > 0).length;
  const percent = Math.round((filled / total) * 100);

  document.getElementById("progress-text").textContent = `Progress: ${filled}/${total} (${percent}%)`;
  document.getElementById("progress-fill").style.width = `${percent}%`;

  const finishedBtn = document.getElementById("finished-btn");
  const submitBtn = document.getElementById("submit-btn");

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

  updateRiskSelector();
}

function saveCurrentFeedback() {
  const textarea = document.getElementById("feedback");
  feedbackCache[risks[currentIndex].title] = textarea.value.trim();
  updateProgress();
}

function renderRisk(index) {
  document.getElementById("risk-title").textContent = risks[index].title;
  document.getElementById("risk-description").textContent = risks[index].description;
  document.getElementById("mitigation-description").textContent = risks[index].mitigation;
  document.getElementById("feedback").value = feedbackCache[risks[index].title] || "";

  document.getElementById("prev-btn").disabled = index === 0;
  document.getElementById("next-btn").disabled = index === risks.length - 1;

  updateProgress();
}

// Setup navigation buttons
document.getElementById("prev-btn").onclick = () => {
  saveCurrentFeedback();
  if (currentIndex > 0) {
    currentIndex--;
    renderRisk(currentIndex);
  }
};

document.getElementById("next-btn").onclick = () => {
  saveCurrentFeedback();
  if (currentIndex < risks.length - 1) {
    currentIndex++;
    renderRisk(currentIndex);
  }
};

document.getElementById("finished-btn").onclick = () => {
  finishedConfirmed = true;
  updateProgress();
};

document.getElementById("submit-btn").onclick = async () => {
  saveCurrentFeedback();

  const allEntries = risks.map(risk => ({
    risk_title: risk.title,
    feedback_text: feedbackCache[risk.title] || ""
  }));

  const response = await fetch("https://rusdxiqbcbkqvqnctbrz.supabase.co/rest/v1/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1c2R4aXFiY2JrcXZxbmN0YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzM2MDUsImV4cCI6MjA3MDE0OTYwNX0.Y1QmIhR3Hl_taG6OshmMclyVmqo7oFVJtBmsNFiWmhU",
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1c2R4aXFiY2JrcXZxbmN0YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzM2MDUsImV4cCI6MjA3MDE0OTYwNX0.Y1QmIhR3Hl_taG6OshmMclyVmqo7oFVJtBmsNFiWmhU",
      "Prefer": "return=minimal"
    },
    body: JSON.stringify(allEntries)
  });

  if (response.ok) {
    alert("✅ All feedback submitted successfully!");
  } else {
    alert("❌ Error submitting feedback.");
    console.error(await response.text());
  }
};

// Setup sidebar toggle for mobile
const sidebarToggle = document.getElementById("toggleSidebar");
if (sidebarToggle) {
  sidebarToggle.addEventListener("click", () => {
    const selector = document.getElementById("risk-selector");
    selector.classList.toggle("open");
  });
}

// Initialize UI
renderRisk(currentIndex);
document.getElementById("feedback").addEventListener("keyup", saveCurrentFeedback);
