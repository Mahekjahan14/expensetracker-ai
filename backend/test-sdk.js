const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: './.env' });

async function run() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
    const base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: "Analyze this bill image. Extract the following details: title (a short description like 'Grocery', 'Restaurant', etc.), amount (as a number), category (e.g. Food, Transport, Utilities, etc.), and date (in YYYY-MM-DD format). Return ONLY a JSON object with keys: title, amount, category, date." },
            { inlineData: { data: base64Data, mimeType: 'image/png' } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });
    
    console.log('Response typeof:', typeof response.text);
    console.log('Response value:', response.text);
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
