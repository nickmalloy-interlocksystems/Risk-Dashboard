async function submitFeedback() {
  const form = document.getElementById('feedbackForm');
  const textareas = form.querySelectorAll('textarea');
  const endpoint = "https://rusdxiqbcbkqvqnctbrz.supabase.co/rest/v1/feedback";
  const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1c2R4aXFiY2JrcXZxbmN0YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzM2MDUsImV4cCI6MjA3MDE0OTYwNX0.Y1QmIhR3Hl_taG6OshmMclyVmqo7oFVJtBmsNFiWmhU";

  let successCount = 0;

  for (const textarea of textareas) {
    const risk_title = textarea.name;
    const feedback_text = textarea.value.trim();

    if (!feedback_text) continue;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": apiKey,
        "Authorization": "Bearer " + apiKey,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({ risk_title, feedback_text })
    });

    if (response.ok) {
      successCount++;
    } else {
      console.error("Error submitting feedback:", await response.text());
    }
  }

  if (successCount > 0) {
    alert("✅ Feedback submitted successfully!");
    form.reset();
  } else {
    alert("⚠️ No feedback submitted.");
  }
}