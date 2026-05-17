import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API Proxy Route
  app.post("/api/gemini/analyze", async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("GEMINI_API_KEY is missing");
        return res.status(500).json({ error: "Gemini API key is not configured" });
      }

      const genAI = new GoogleGenAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are an empathetic psychological counselor helping male students explore the impact of masculinity norms on their emotions.
      The user shared this problem: "${content}"
      
      Please help them:
      1. Empathize with their feelings.
      2. Briefly analyze if any social expectations of "being a man" (e.g., tough it out, don't cry) might be making this harder.
      3. Suggest 2-3 small, actionable steps they can take to process these emotions.
      
      Keep your tone warm, supportive, and non-judgmental. Use English for your response.`;

      const result = await model.generateContent(prompt);
      if (!result || !result.response) {
        throw new Error("Empty response from Gemini API");
      }
      const text = result.response.text();
      console.log("Gemini Response success");
      res.json({ text });
    } catch (error: any) {
      console.error("Gemini API Error Detail:", error);
      res.status(500).json({ 
        error: error.message || "Failed to communicate with Gemini",
        detail: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
