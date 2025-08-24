import { GoogleGenAI } from "@google/genai";
import type { HandlerEvent } from "@netlify/functions";

// Ensure the API key is set in your Netlify environment variables
const { GEMINI_API_KEY } = process.env;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const model = "gemini-2.5-flash";

const handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { prompt } = JSON.parse(event.body || "{}");
    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Prompt is required" }),
      };
    }

    const result = await ai.models.generateContentStream({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are RepRocket's AI Coach, a friendly and motivational fitness expert. Provide concise, actionable workout advice, exercise alternatives, or form tips. Use markdown for formatting, especially for lists. Keep responses focused on the user's request.",
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result) {
          controller.enqueue(encoder.encode(chunk.text));
        }
        controller.close();
      },
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: stream,
    };
  } catch (error) {
    console.error("Error in generateWorkoutSuggestionStream:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to get a response from the AI coach." }),
    };
  }
};

export { handler };
