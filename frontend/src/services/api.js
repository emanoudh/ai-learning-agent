const API = "https://ai-learning-agent-cs7c.onrender.com";

export async function sendMessage(message) {
  const res = await fetch(`${API}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  return await res.json();
}

export async function getLesson(topic, level) {
  const res = await fetch(`${API}/daily-lesson`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, level }),
  });

  return await res.json();
}

export async function getQuiz(topic, level) {
  const res = await fetch(`${API}/quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, level }),
  });

  return await res.json();
}
export async function saveSetup(settings) {
  const res = await fetch(`${API}/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });

  return await res.json();
}