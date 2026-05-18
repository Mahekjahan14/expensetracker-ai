const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');

const upload = multer({ storage: multer.memoryStorage() });

// Create
router.post('/', async (req, res) => {
 try {
   const expense = await Expense.create(req.body);
   res.status(201).json(expense);
 } catch (err) {
   res.status(500).json({ error: err.message });
 }
});

// Upload Image and Analyze
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({ error: 'GOOGLE_API_KEY is not configured in Vercel Environment Variables' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    // Convert buffer to base64
    const base64Data = req.file.buffer.toString('base64');
    
    // Call Gemini using universally supported multimodal 1.5-flash
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

    // Create expense from extracted data
    const expense = await Expense.create({
      title: extractedData?.title || 'Unknown Bill',
      amount: extractedData?.amount || 0,
      category: extractedData?.category || 'Other',
      date: extractedData?.date || new Date().toISOString().split('T')[0]
    });

    res.status(201).json(expense);
  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ error: err.message || 'AI processing failed' });
  }
});

// Read
router.get('/', async (req, res) => {
 try {
   const expenses = await Expense.find();
   res.json(expenses);
 } catch (err) {
   res.status(500).json({ error: err.message });
 }
});

// Update
router.put('/:id', async (req, res) => {
 try {
   const updatedExpense = await Expense.findByIdAndUpdate(
     req.params.id,
     req.body,
     { new: true }
   );

   res.json(updatedExpense);
 } catch (err) {
   res.status(500).json({ error: err.message });
 }
});

// Delete
router.delete('/:id', async (req, res) => {
 try {
   await Expense.findByIdAndDelete(req.params.id);
   res.json({ message: 'Expense deleted' });
 } catch (err) {
   res.status(500).json({ error: err.message });
 }
});

module.exports = router;
