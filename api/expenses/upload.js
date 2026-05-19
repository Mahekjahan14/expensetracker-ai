const { GoogleGenAI } = require('@google/genai');
const connectDB = require('../../utils/db');
const Expense = require('../../models/Expense');
const Busboy = require('busboy');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    await connectDB();

    // Parse multipart/form-data using busboy
    const fileData = await new Promise((resolve, reject) => {
      const contentType = req.headers['content-type'] || '';
      const bb = Busboy({ headers: req.headers });
      let fileBuffer = null;
      let mimeType = 'image/jpeg';
      let originalname = 'upload';

      bb.on('file', (fieldname, file, info) => {
        mimeType = info.mimeType || 'image/jpeg';
        originalname = info.filename || 'upload';
        const chunks = [];
        file.on('data', (chunk) => chunks.push(chunk));
        file.on('end', () => { fileBuffer = Buffer.concat(chunks); });
      });

      bb.on('finish', () => {
        if (!fileBuffer) return reject(new Error('No image file found in request'));
        resolve({ buffer: fileBuffer, mimetype: mimeType, originalname });
      });

      bb.on('error', (err) => reject(err));
      req.pipe(bb);
    });

    let extractedData;

    if (!process.env.GOOGLE_API_KEY) {
      console.log('No GOOGLE_API_KEY detected. Running in simulation mode.');
      const filenameBase = fileData.originalname.split('.')[0];
      const title = isNaN(filenameBase)
        ? filenameBase.charAt(0).toUpperCase() + filenameBase.slice(1) + ' Scan'
        : 'Simulated Bill #' + filenameBase;
      extractedData = {
        title,
        amount: Math.floor(Math.random() * 800) + 120,
        category: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities'][Math.floor(Math.random() * 5)],
        date: new Date().toISOString().split('T')[0],
      };
    } else {
      const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
      const base64Data = fileData.buffer.toString('base64');

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: "Analyze this bill image. Extract the following details: title (a short description like 'Grocery', 'Restaurant', etc.), amount (as a number), category (e.g. Food, Transport, Utilities, etc.), and date (in YYYY-MM-DD format). Return ONLY a JSON object with keys: title, amount, category, date.",
              },
              { inlineData: { data: base64Data, mimeType: fileData.mimetype } },
            ],
          },
        ],
        config: { responseMimeType: 'application/json' },
      });

      const resultText = response.text;
      try {
        extractedData = JSON.parse(resultText);
      } catch (e) {
        const cleaned = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        extractedData = JSON.parse(cleaned);
      }
    }

    const expense = await Expense.create({
      title: extractedData?.title || 'Unknown Bill',
      amount: Number(extractedData?.amount) || 0,
      category: extractedData?.category || 'Other',
      date: extractedData?.date || new Date().toISOString().split('T')[0],
    });

    res.status(201).json(expense);
  } catch (err) {
    console.error('AI Upload Error:', err);
    res.status(500).json({ error: err.message || 'AI processing failed' });
  }
};
