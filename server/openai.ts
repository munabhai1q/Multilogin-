// Ollama AI Assistant Integration

// List of models to try in order of preference
const OLLAMA_MODELS = ["mistral", "llama2", "llama3", "gemma", "phi"];

// Function to send a message to Ollama and get a response
export async function getChatCompletion(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
) {
  try {
    // Format messages for Ollama API
    const formatMessages = messages.map(msg => {
      // Convert OpenAI format to Ollama format
      return {
        role: msg.role,
        content: msg.content
      };
    });
    
    // First, try to list available models to find the best one
    let modelToUse = "mistral"; // Default fallback
    
    try {
      const modelsResponse = await fetch("http://localhost:11434/api/tags", {
        method: "GET"
      });
      
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        const availableModels = modelsData.models?.map(m => m.name.toLowerCase()) || [];
        
        // Find the first available model from our preferred list
        for (const model of OLLAMA_MODELS) {
          if (availableModels.includes(model) || availableModels.some(m => m.startsWith(model))) {
            modelToUse = model;
            break;
          }
        }
      }
    } catch (error) {
      console.log("Could not fetch available models, using default:", error);
    }
    
    // Make request to Ollama API
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: formatMessages,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      content: data.message?.content || "I couldn't generate a response at this time.",
      success: true,
    };
  } catch (error) {
    console.error("Error calling Ollama:", error);
    
    // Create a friendly message explaining how to use Ollama
    const errorMessage = `
I'm having trouble connecting to my brain right now. To use the WebSense AI, you'll need to:

1. Install Ollama from ollama.com
2. Run the application
3. Install a model by running 'ollama pull mistral' in your terminal

Once Ollama is running, I'll be able to help you organize and manage your bookmarks more effectively!
    `.trim();
    
    return {
      content: errorMessage,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}