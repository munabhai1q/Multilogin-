import OpenAI from "openai";

// Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: "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",
});

// Function to send a message to ChatGPT and get a response
export async function getChatCompletion(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
) {
  try {
    // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
    });

    return {
      content: response.choices[0].message.content,
      success: true,
    };
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return {
      content: "Sorry, I encountered an error processing your request.",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}