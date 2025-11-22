import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Configure storage for user audio
const userAudioDir = path.join(__dirname, 'userAudio');

// Ensure the directory exists
if (!fs.existsSync(userAudioDir)) {
  fs.mkdirSync(userAudioDir, { recursive: true });
}

// Set up Multer to store the file as 'voices.mp3'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, userAudioDir);
  },
  filename: function (req, file, cb) {
    // Storing as voices.mp3 as requested
    cb(null, 'voices.mp3');
  }
});

const upload = multer({ storage: storage });

app.post('/api/chat', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    if (!process.env.API_KEY) {
      console.error("API_KEY is missing in environment variables.");
      return res.status(500).json({ error: "Server API Key configuration error" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Read the stored file
    const filePath = path.join(userAudioDir, 'voices.mp3');
    const fileBuffer = fs.readFileSync(filePath);
    const base64Audio = fileBuffer.toString('base64');

    // Prepare the audio part for Gemini
    // Note: Even if the container is WebM (from browser), Gemini 2.5 is robust enough 
    // to handle it even with an mp3 extension/mime-type hint in many cases, 
    // but we pass the data exactly as received and stored.
    const audioPart = {
      inlineData: {
        mimeType: 'audio/mp3', 
        data: base64Audio
      }
    };

    const model = 'gemini-2.5-flash';
    
    // Call Gemini API
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        role: 'user',
        parts: [
          audioPart,
          { text: "Listen to this voice message and provide a helpful, natural response." }
        ]
      }
    });

    res.json({ text: response.text });

  } catch (error) {
    console.error('Error processing voice message:', error);
    res.status(500).json({ error: 'Failed to process voice message' });
  }
});

app.listen(port, () => {
  console.log(`Node.js server running on port ${port}`);
});