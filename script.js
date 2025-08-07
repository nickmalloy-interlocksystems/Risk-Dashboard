const risks = [
  {
    title: "Policy / Legal Risk",
    description: "PDPL, GDPR, HIPAA non-compliance → fines, lawsuits; regulator classifies Nesya as unlicensed therapy.",
    mitigation: "Encrypt-all + ISO 27001 audit → Locks PDPL / HIPAA compliance; deters breaches."
  },
  {
    title: "Technical Risk",
    description: "AI error & crisis mis-detection → missed suicidality signals; model drift & bias against rural dialects.",
    mitigation: "Real-time crisis escalation → Hotline integration + 60-sec human callback SLA."
  },
  {
    title: "Data Risk",
    description: "Informed-consent gaps; chat logs reused without user understanding.",
    mitigation: "Plain-language consent & pop-up limits → 'I'm an AI, not a therapist…'"
  },
  {
    title: "Medical Risk",
    description: "Misdiagnosis → breathing exercise triggers PTSD panic; escalation fails before human intervention.",
    mitigation: "Clinical–Ethics Advisory Board + longitudinal outcome research."
  },
  {
    title: "Societal Risk",
    description: "Public mistrust & over-reliance → Youth substitute bot for real relationships.",
    mitigation: "Healthy-use nudges + Transparent AI policy site."
  },
  {
    title: "Environmental Risk",
    description: "High-carbon AI ops → Publicized CO₂ footprint intensifies climate anxiety.",
    mitigation: "Sustainability transparency (e.g. publish emissions & offset data)."
  }
];

let currentIndex = 0;
let feedbackCache = {};
let finishedConfirmed = false;

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

  const textarea = document.getElementById("feedback");
  textarea.value = feedbackCache[risks[index].title] || "";

  document.getElementById("prev-btn").disabled = index === 0;
  document.getElementById("next-btn").disabled = index === risks.length - 1;

  updateProgress();
}

// Navigation buttons
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

// Initial render
renderRisk(currentIndex);

// Live progress update on typing
document.getElementById("feedback").addEventListener("keyup", () => {
  saveCurrentFeedback();
});
