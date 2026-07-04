import { useEffect, useState } from "react";
import Header from "./components/Header";
import { sendMessage as sendMessageAPI, getLesson, getQuiz, saveSetup } from "./services/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [lesson, setLesson] = useState("");
  const [quiz, setQuiz] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [topic, setTopic] = useState(localStorage.getItem("topic") || "React");
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");
  const [task, setTask] = useState(localStorage.getItem("task") || "");
  const [keywords, setKeywords] = useState(localStorage.getItem("keywords") || "");
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [dailyTime, setDailyTime] = useState(
  localStorage.getItem("dailyTime") || "08:00"
);

  const [isSetupDone, setIsSetupDone] = useState(
    localStorage.getItem("isSetupDone") === "true"
  );

  const level = "beginner";

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = message;
    setChat((prev) => [...prev, { role: "user", text: userMsg }]);
    setMessage("");

    const data = await sendMessageAPI(userMsg);
    setChat((prev) => [...prev, { role: "ai", text: data.reply }]);
  };

  const loadLesson = async () => {
    setActiveTab("lesson");
    setLoading(true);
    const data = await getLesson(topic, level);
    setLesson(data.lesson);
    setProgress((p) => Math.min(p + 20, 100));
    setLoading(false);
  };
 useEffect(() => {
  const checkSchedule = () => {
    const today = new Date().toDateString();
    const currentTime = new Date().toTimeString().slice(0, 5);

    const lastLessonDate = localStorage.getItem("lastLessonDate");
    const savedTime = localStorage.getItem("dailyTime");

    if (
      isSetupDone &&
    currentTime === savedTime &&
      lastLessonDate !== today
    ) {
      loadLesson();
      localStorage.setItem("lastLessonDate", today);
    }
  };

  checkSchedule();

const interval = setInterval(checkSchedule, 60000);

return () => {
  clearInterval(interval);
};

}, [isSetupDone]);
  const loadQuiz = async () => {
    setActiveTab("quiz");
    setLoading(true);
    const data = await getQuiz(topic, level);
    setQuiz(data.quiz);
    setProgress((p) => Math.min(p + 20, 100));
    setLoading(false);
  };

  if (!isSetupDone) {
    return (
      <div style={{ padding: "40px", maxWidth: "500px", margin: "80px auto" }}>
        <h1>Initial Setup</h1>

        <input placeholder="Your Name" value={userName} onChange={(e) => setUserName(e.target.value)} style={{ width: "100%", padding: "12px", marginBottom: "15px" }} />

        <input placeholder="Required Task" value={task} onChange={(e) => setTask(e.target.value)} style={{ width: "100%", padding: "12px", marginBottom: "15px" }} />

        <input placeholder="Keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} style={{ width: "100%", padding: "12px", marginBottom: "15px" }} />

        <input placeholder="Topic (Python, AI, React...)" value={topic} onChange={(e) => setTopic(e.target.value)} style={{ width: "100%", padding: "12px", marginBottom: "15px" }} />

        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "12px", marginBottom: "20px" }} />
<input
  type="time"
  value={dailyTime}
  onChange={(e) => setDailyTime(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    marginBottom: "20px",
  }}
/>
        <button
        onClick={async () => {

  await saveSetup({
    userName,
    task,
    keywords,
    topic,
    email,
    dailyTime,
  });
  console.log("Setup sent successfully");

  localStorage.setItem("userName", userName);
  localStorage.setItem("task", task);
  localStorage.setItem("keywords", keywords);
  localStorage.setItem("topic", topic);
  localStorage.setItem("email", email);
  localStorage.setItem("dailyTime", dailyTime);

  localStorage.setItem("isSetupDone", "true");
  setIsSetupDone(true);
}}
        >
          Start Agent
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <Header />

      <div style={{ textAlign: "right", padding: "15px" }}>
  <button
    onClick={() => {
      localStorage.clear();
      window.location.reload();
    }}
    style={{
      background: "#dc2626",
      color: "white",
      border: "none",
      padding: "10px 18px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    🔄 Reset Setup
  </button>
</div>

      <div style={{ display: "flex", height: "calc(100vh - 70px)" }}>
        <aside style={{ width: "260px", background: "#0f172a", color: "white", padding: "24px" }}>
          <h2 style={{ marginBottom: "30px" }}>📚 Dashboard</h2>

          <p style={{ cursor: "pointer" }} onClick={() => setActiveTab("chat")}>💬 Chat</p>
          <p style={{ cursor: "pointer" }} onClick={loadLesson}>📖 Daily Lesson</p>
          <p style={{ cursor: "pointer" }} onClick={loadQuiz}>📝 Quiz</p>
          <p style={{ cursor: "pointer" }} onClick={() => setActiveTab("progress")}>📈 Progress</p>
        </aside>

        <main style={{ flex: 1, padding: "30px", display: "flex", flexDirection: "column" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", flex: 1, overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
            {activeTab === "chat" && (
              <>
                <h1>💬 AI Learning Chat</h1>
                {chat.map((c, i) => (
                  <div key={i} style={{ margin: "14px 0", padding: "14px", borderRadius: "12px", background: c.role === "user" ? "#dbeafe" : "#f8fafc" }}>
                    <b>{c.role === "user" ? "You" : "AI"}:</b> {c.text}
                  </div>
                ))}
              </>
            )}

            {activeTab === "lesson" && (
              <>
                <h1>📖 Daily Lesson</h1>
                <pre style={{ whiteSpace: "pre-wrap", fontFamily: "Arial" }}>
                  {loading ? "جاري إنشاء الدرس..." : lesson}
                </pre>
              </>
            )}

            {activeTab === "quiz" && (
              <>
                <h1>📝 Quiz</h1>
                <pre style={{ whiteSpace: "pre-wrap", fontFamily: "Arial" }}>
                  {loading ? "جاري إنشاء الاختبار..." : quiz}
                </pre>
              </>
            )}

            {activeTab === "progress" && (
              <>
                <h1>📈 Progress</h1>
                <p>نسبة التقدم: {progress}%</p>
                <div style={{ background: "#e2e8f0", borderRadius: 10 }}>
                  <div style={{ width: `${progress}%`, background: "#2563eb", color: "white", padding: "10px", borderRadius: 10 }}>
                    {progress}%
                  </div>
                </div>
              </>
            )}
          </div>

          {activeTab === "chat" && (
            <div style={{ display: "flex", marginTop: "20px", gap: "10px" }}>
              <input
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  localStorage.setItem("topic", e.target.value);
                }}
                placeholder="اكتب الموضوع (React, Python, AI...)"
                style={{ flex: 1, padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "16px" }}
              />

              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتبي سؤالك هنا..."
                style={{ flex: 1, padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "16px" }}
              />

              <button onClick={sendMessage} style={{ padding: "0 26px", borderRadius: "12px", border: "none", background: "#2563eb", color: "white", fontWeight: "bold", cursor: "pointer" }}>
                إرسال
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}