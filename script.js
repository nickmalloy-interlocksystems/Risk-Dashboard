
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

function renderRisk(index) {
  document.getElementById("risk-title").textContent = risks[index].title;
  document.getElementById("risk-description").textContent = risks[index].description;
  document.getElementById("mitigation-description").textContent = risks[index].mitigation;
  document.getElementById("feedback").value = "";
}

document.getElementById("prev-btn").onclick = () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderRisk(currentIndex);
  }
};

document.getElementById("next-btn").onclick = () => {
  if (currentIndex < risks.length - 1) {
    currentIndex++;
    renderRisk(currentIndex);
  }
};

document.getElementById("submit-btn").onclick = async () => {
  const feedback = document.getElementById("feedback").value.trim();
  if (!feedback) return alert("Please enter feedback before submitting.");

  const entry = {
    risk_title: risks[currentIndex].title,
    feedback_text: feedback
  };

  const response = await fetch("https://rusdxiqbcbkqvqnctbrz.supabase.co/rest/v1/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1c2R4aXFiY2JrcXZxbmN0YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzM2MDUsImV4cCI6MjA3MDE0OTYwNX0.Y1QmIhR3Hl_taG6OshmMclyVmqo7oFVJtBmsNFiWmhU",
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1c2R4aXFiY2JrcXZxbmN0YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzM2MDUsImV4cCI6MjA3MDE0OTYwNX0.Y1QmIhR3Hl_taG6OshmMclyVmqo7oFVJtBmsNFiWmhU",
      "Prefer": "return=minimal"
    },
    body: JSON.stringify(entry)
  });

  if (response.ok) {
    alert("✅ Feedback submitted!");
  } else {
    alert("❌ Error submitting feedback.");
    console.error(await response.text());
  }
};

renderRisk(currentIndex);
