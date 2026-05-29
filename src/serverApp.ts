import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";

dotenv.config();

const app = express();

app.use(express.json());

// Determine if we are in Vercel environment
const isVercel = !!process.env.VERCEL;
const uploaddir = isVercel ? path.join("/tmp", "uploads") : path.join(process.cwd(), "uploads");

if (!isVercel && !fs.existsSync(uploaddir)) {
  fs.mkdirSync(uploaddir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (isVercel && !fs.existsSync(uploaddir)) {
      fs.mkdirSync(uploaddir, { recursive: true });
    }
    cb(null, uploaddir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "_");
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Serve static files from uploads directory
app.use("/uploads", express.static(uploaddir));

// File upload route
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.filename, size: req.file.size });
  } catch (error: any) {
    console.error("Upload route error:", error);
    res.status(500).json({ error: error?.message || "Failed to process uploaded file" });
  }
});

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

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const prompt = `You are an empathetic psychological counselor helping male students explore the impact of masculinity norms on their emotions.
    The user shared this problem: "${content}"
    
    Please help them:
    1. Empathize with their feelings.
    2. Briefly analyze if any social expectations of "being a man" (e.g., tough it out, don't cry) might be making this harder.
    3. Suggest 2-3 small, actionable steps they can take to process these emotions.
    
    Keep your tone warm, supportive, and non-judgmental. Use English for your response.`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = result.text;
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

export default app;
