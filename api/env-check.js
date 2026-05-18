module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: "Environment Diagnostics Active",
    mongoUriConfigured: !!(process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL),
    googleApiKeyConfigured: !!process.env.GOOGLE_API_KEY,
    geminiApiKeyConfigured: !!process.env.GEMINI_API_KEY,
    environmentMode: process.env.NODE_ENV || "development",
    availableKeysMatchingSecrets: Object.keys(process.env).filter(key => 
      key.includes('MONGO') || key.includes('GOOGLE') || key.includes('GEMINI') || key.includes('DB') || key.includes('URI')
    )
  });
};
