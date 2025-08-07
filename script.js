async function submitFeedback() {
  const form = document.getElementById('feedbackForm');
  const textareas = form.querySelectorAll('textarea');

  const endpoint = "https://rusdxiqbcbkqvqnctbrz.supabase.co/rest/v1/feedback";
  const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1c2R4aXFiY2JrcXZxbmN0YnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NzM2MDUsImV4cCI6MjA3MDE0OTYwNX0.Y1QmIhR3Hl_taG6OshmMclyVmqo7oFVJtBmsNFiWmhU";

  let feedbacks = [];

  textareas.forEach((textarea) => {
    const risk_title = textarea.name;
    const feedback_text = textarea.value.trim();

    if (feedback_text.length > 0) {
      feedbacks.push({
        risk_title,
        feedback_text,
        timestamp: new Date().toISOString()
      });
          }
  });

  if (feedbacks.length === 0) {
    alert("⚠️ No feedback submitted.");
    return;
  }

  try {
    const responses = await Promise.all(
      feedbacks.map((entry) =>
        fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": apiKey,
            "Authorization": "Bearer " + apiKey,
            "Prefer": "return=minimal",
          },
          body: JSON.stringify(entry),
        })
      )
    );

    const allSuccess = responses.every((res) => res.ok);

    if (allSuccess) {
      alert("✅ Feedback submitted successfully!");
      form.reset();
    } else {
      console.error("Some responses failed:", responses);
      alert("⚠️ Some feedback could not be submitted.");
    }
  } catch (err) {
    console.error("Submission error:", err);
    alert("❌ Failed to submit feedback. Check console.");
  }
}