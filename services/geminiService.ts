
import { DayData } from "../types";

// Helper function to handle fetch errors
const handleFetchErrors = async (response: Response) => {
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorBody.error || `Request failed with status ${response.status}`);
    }
    return response;
};

export const generateWorkoutSuggestionStream = async (prompt: string) => {
  try {
    const response = await fetch('/.netlify/functions/generateWorkoutSuggestionStream', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
    });
    
    await handleFetchErrors(response);

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error("Could not read stream from response.");
    }
    const decoder = new TextDecoder();
    
    // Return an async iterator that mimics the original stream
    return (async function* () {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        // Yield an object that has the 'text' property, like the original SDK response
        yield { text: decoder.decode(value) };
      }
    })();

  } catch (error) {
    console.error("Error calling generateWorkoutSuggestionStream function:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get a response from the AI coach: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the AI coach.");
  }
};

export const estimateCaloriesBurned = async (workout: DayData, userName: string): Promise<{ burnedCalories: number }> => {
    try {
        const response = await fetch('/.netlify/functions/estimateCaloriesBurned', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ workout, userName }),
        });

        await handleFetchErrors(response);
        return await response.json();

    } catch (error) {
        console.error("Error calling estimateCaloriesBurned function:", error);
        if (error instanceof Error) {
            throw new Error(`AI failed to estimate calories: ${error.message}`);
        }
        throw new Error("An unknown error occurred during calorie estimation.");
    }
};
