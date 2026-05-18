const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: './.env' });

// Simulate exactly what the route does
async function runTest() {
  console.log('=== Testing GOOGLE_API_KEY from .env ===');
  console.log('Key present:', !!process.env.GOOGLE_API_KEY);
  console.log('Key value:', process.env.GOOGLE_API_KEY);

  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

  // 1x1 red PNG
  const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [
          { text: "Analyze this bill image. Extract: title, amount (as number), category, date (YYYY-MM-DD). Return ONLY JSON with keys: title, amount, category, date." },
          { inlineData: { data: base64Data, mimeType: 'image/png' } }
        ]
      }],
      config: { responseMimeType: "application/json" }
    });

    console.log('\n=== SUCCESS ===');
    console.log('Response:', response.text);
  } catch (e) {
    console.log('\n=== FAILED ===');
    console.log('Error:', e.message);
  }
}

runTest();
