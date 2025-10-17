import express from "express";
import dotenv from "dotenv";
import { generateSite } from "./siteGenerator.js"; // <-- add this

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "Server is running fine ✅" });
});

app.post("/api/task", async (req, res) => {
  const { email, secret, task, brief = "", attachments = [] } = req.body || {};

  if (!email || !secret || !task) {
    return res.status(400).json({ ok: false, error: "Missing fields" });
  }
  if (secret !== process.env.STUDENT_SECRET) {
    return res.status(403).json({ ok: false, error: "Invalid secret" });
  }

  // 👉 Generate/refresh docs/index.html based on brief + attachments
  await generateSite({ brief, attachments });

  return res.status(200).json({
    ok: true,
    message: "Task received, site generated ✅",
    task,
    email
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 API running on http://localhost:${port}`));
