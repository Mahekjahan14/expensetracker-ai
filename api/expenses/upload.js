const express = require('express');
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');
const connectDB = require('../../utils/db');
const Expense = require('../../models/Expense');
const cors = require('cors');

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

const uploadHandler = async (req, res) => {
  try {
    await connectDB();

    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({ error: 'GOOGLE_API_KEY is not configured in Vercel Environment Variables' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
    const base64Data = req.file.buffer.toString('base64');
    
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: "Analyze this bill image. Extract the following details: title (a short description like 'Grocery', 'Restaurant', etc.), amount (as a number), category (e.g. Food, Transport, Utilities, etc.), and date (in YYYY-MM-DD format). Return ONLY a JSON object with keys: title, amount, category, date." },
            { inlineData: { data: base64Data, mimeType: req.file.mimetype } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text;
    let extractedData;
    try {
      extractedData = JSON.parse(resultText);
    } catch (e) {
      const cleaned = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
      extractedData = JSON.parse(cleaned);
    }

    const expense = await Expense.create({
      title: extractedData?.title || 'Unknown Bill',
      amount: Number(extractedData?.amount) || 0,
      category: extractedData?.category || 'Other',
      date: extractedData?.date || new Date().toISOString().split('T')[0]
    });

    res.status(201).json(expense);
  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ error: err.message || 'AI processing failed' });
  }
};

app.post('/api/expenses/upload', upload.single('image'), uploadHandler);
app.post('/', upload.single('image'), uploadHandler);
app.post('/upload', upload.single('image'), uploadHandler);

module.exports = app;
