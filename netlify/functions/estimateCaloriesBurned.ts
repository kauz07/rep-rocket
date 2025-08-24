import { GoogleGenAI, Type } from "@google/genai";
import type { Handler, HandlerEvent } from "@netlify/functions";

// Ensure the API key is set in your Netlify environment variables
const { GEMINI_API_KEY } = process.env;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const model = "gemini-2.5-flash";

const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed" }),
        };
    }
    
    try {
        const { workout, userName } = JSON.parse(event.body || "{}");
        if (!workout || !userName) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Workout data and user name are required." }),
            };
        }

        const exercisesString = workout.exercises.map((ex: any) => `- ${ex.name}`).join('\n');

        const prompt = `
            User Name: ${userName}
            Workout Title: ${workout.title}
            Exercises Performed:
            ${exercisesString}

            Based on this workout data, please provide a rough, single numerical estimate of the total calories burned. Consider the mix of compound and isolation exercises. Assume a standard 1-hour workout duration if not specified.
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction: "You are a fitness expert AI that estimates calories burned during a workout. Provide only a single JSON object with the key 'burnedCalories' and a number value. Do not add any other text or explanation.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        burnedCalories: {
                            type: Type.INTEGER,
                            description: "Estimated calories burned."
                        }
                    }
                }
            }
        });

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: response.text.trim(),
        };

    } catch (error) {
        console.error("Error estimating calories:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "AI failed to estimate calories." }),
        };
    }
};

export { handler };
