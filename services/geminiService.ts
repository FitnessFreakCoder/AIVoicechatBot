import { Message } from "../types";

const API_URL = "http://localhost:5000/api/chat";

/**
 * Sends an audio blob to the Flask backend for processing.
 * The backend will:
 * 1. Save the audio file to 'userAudio/'
 * 2. Send the audio to Gemini
 * 3. Return the text response
 */
export const processVoiceMessage = async (
  audioBlob: Blob,
  history: Message[]
): Promise<string> => {
  try {
    const formData = new FormData();
    
    // Append audio file. 
    // Note: We use a .mp3 extension in the filename hint, though the browser might send WebM.
    // The backend handles the actual content type.
    formData.append("audio", audioBlob, "voice_message.mp3");
    
    // Prepare minimal history payload to save bandwidth
    const recentHistory = history.slice(-10).map(msg => ({
      role: msg.role,
      text: msg.text || "" 
    }));
    formData.append("history", JSON.stringify(recentHistory));

    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || `Server error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text || "I couldn't generate a response.";

  } catch (error) {
    console.error("Error calling backend:", error);
    throw new Error("Failed to process voice message. Is the Flask server running?");
  }
};