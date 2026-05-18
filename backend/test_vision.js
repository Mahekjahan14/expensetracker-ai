const { GoogleGenAI } = require('@google/genai');
const http = require('http');
const ai = new GoogleGenAI({ apiKey: 'AIzaSyB6J_tAaq8JWKwV8wC3WTYKbJx0H_BgMfI' });

// Try with a simple 1x1 red pixel PNG (valid image)
const base64Img = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==';

const models = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-flash'];

async function test() {
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{
          role: 'user',
          parts: [
            { text: 'What color is this image? Just say the color.' },
            { inlineData: { data: base64Img, mimeType: 'image/png' } }
          ]
        }]
      });
      console.log(`[${model}] SUCCESS:`, response.text.trim());
    } catch (e) {
      console.log(`[${model}] ERROR:`, e.message.substring(0, 120));
    }
  }
}

test();
