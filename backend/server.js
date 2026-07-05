const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const cron = require("node-cron");
const nodemailer = require("nodemailer");

const app = express();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("AI Daily Learning Agent Backend is running ✅");
});
let agentSettings = null;
let lastAutomatedRunDate = null;
async function askGemini(prompt) {
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
       model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error(`Gemini Error (Attempt ${attempt}):`, error.message);

      const status =
        error?.status ||
        error?.error?.code ||
        error?.response?.status;

      if ((status === 503 || status === 429) && attempt < MAX_RETRIES) {
        console.log("Retrying in 5 seconds...");
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }

      throw error;
    }
  }
}

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    console.log("وصل الطلب إلى Gemini");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMessage,
    });

    res.json({
      reply: response.text,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      reply: "حدث خطأ أثناء الاتصال بـ Gemini.",
    });
  }
});
app.post("/daily-lesson", async (req, res) => {
  try {
    const { topic, level } = req.body;

    const lesson = await askGemini(`
أنشئ درسًا تعليميًا باللغة العربية عن:
الموضوع: ${topic}
المستوى: ${level}

اجعل الدرس منظمًا وسهل الفهم مع أمثلة.
`);

    res.json({ lesson });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      lesson: "حدث خطأ أثناء إنشاء الدرس.",
    });
  }
});

app.post("/quiz", async (req, res) => {
  try {
    const { topic, level } = req.body;

    const quiz = await askGemini(`
أنشئ اختبارًا باللغة العربية عن:
الموضوع: ${topic}
المستوى: ${level}

أنشئ 5 أسئلة اختيار من متعدد مع الإجابات الصحيحة في النهاية.
`);

    res.json({ quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      quiz: "حدث خطأ أثناء إنشاء الاختبار.",
    });
  }
});

app.post("/setup", async (req, res) => {

  agentSettings = req.body;
  try {
  const lesson = await askGemini(`
Generate today's learning lesson.

Task:
${agentSettings.task}

Topic:
${agentSettings.topic}

Keywords:
${agentSettings.keywords}

Make today's lesson practical and useful.
`);

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: agentSettings.email,
    subject: `📚 Daily AI Lesson - ${agentSettings.topic}`,
    text: lesson,
  });

  console.log("📧 First email sent successfully!");
} catch (err) {
 console.error("Email Error:", err);
console.error(err.stack);
}

  console.log("✅ Agent Setup Saved:");
  console.log(agentSettings);

  res.json({
    success: true,
    message: "Agent setup saved successfully.",
  });
});








cron.schedule("* * * * *", async () => {
  if (!agentSettings) return;

  const now = new Date();

const currentTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Amman",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
}).format(now);

const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Amman",
}).format(now);

console.log("Current Jordan Time:", currentTime);
console.log("Saved Time:", agentSettings?.dailyTime);

if (
  currentTime === agentSettings.dailyTime &&
  lastAutomatedRunDate !== today
) {
  console.log("🚀 Running Daily Agent...");

  // منع تكرار التنفيذ في نفس اليوم
  lastAutomatedRunDate = today;

  try {
      const lesson = await askGemini(`
Generate today's learning lesson.

Task:
${agentSettings.task}

Topic:
${agentSettings.topic}

Keywords:
${agentSettings.keywords}

Make today's lesson different from yesterday.
`);
console.log("✅ Lesson Generated");
console.log(lesson);

await transporter.sendMail({
  from: process.env.GMAIL_USER,
  to: agentSettings.email,
  subject: `📚 Daily AI Lesson - ${agentSettings.topic}`,
  text: lesson,
});

console.log("📧 Email sent successfully!");



      // هنا لاحقًا يمكن إرسال الإيميل
    } catch (err) {
      console.error(err);
    }
  }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});