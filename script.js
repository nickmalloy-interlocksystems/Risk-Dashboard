async function submitFeedback() {
  const form = document.getElementById('feedbackForm');
  const textareas = form.querySelectorAll('textarea');

  const endpoint = "https://rusdxiqbcbkqvqnctbrz.supabase.co/rest/v1/feedback";
  const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // shortened for display

  let feedbacks = [];

  // Step 1: Collect non-empty feedback entries
  textareas.forEach((textarea) => {
    const risk_title = textarea.name;
    const feedback_text = textarea.value.trim();

    if (feedback_text.length > 0) {
      feedbacks.push({ risk_title, feedback_text });
    }
  });

  if (feedbacks.length === 0) {
    alert("⚠️ No feedback submitted.");
    return;
  }

  // Step 2: Submit feedback entries in parallel
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
