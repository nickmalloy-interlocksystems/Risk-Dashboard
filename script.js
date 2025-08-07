const risks = [
  { title: "Policy / Legal Risk", description: "...", mitigation: "..." },
  { title: "Technical Risk", description: "...", mitigation: "..." },
  { title: "Data Risk", description: "...", mitigation: "..." },
  { title: "Medical Risk", description: "...", mitigation: "..." },
  { title: "Societal Risk", description: "...", mitigation: "..." },
  { title: "Environmental Risk", description: "...", mitigation: "..." }
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
    item.className = "risk-selector-item";
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

// Navigation
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
      "apikey": "...",
      "Authorization": "...",
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

// Init
renderRisk(currentIndex);
document.getElementById("feedback").addEventListener("keyup", saveCurrentFeedback);
