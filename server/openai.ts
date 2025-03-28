// WebSense AI Assistant Integration

// Function to send a message to Ollama and get a response
// This is a fallback implementation that simulates AI responses when Ollama is not available
export async function getChatCompletion(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
) {
  try {
    // Get the user's last message
    const userMessage = messages.filter(msg => msg.role === "user").pop()?.content || "";
    
    // Get a simulated response based on the user's question
    const response = getSimulatedResponse(userMessage);
    
    return {
      content: response,
      success: true,
    };
  } catch (error) {
    console.error("Error in AI response:", error);
    
    return {
      content: "I'm having a bit of a brain freeze right now. Please try again later!",
      success: true,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Function to generate simulated responses for common bookmark-related questions
function getSimulatedResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  // Determine which type of response to give based on user's message
  if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
    return "Hey there! I'm WebSense, your friendly neighborhood bookmark assistant. How can I help you organize your web today?";
  }
  
  if (message.includes("help") || message.includes("what can you do")) {
    return "With great power comes great organization! I can help you with organizing bookmarks, suggest categorization strategies, and provide tips for better bookmark management. What would you like help with today?";
  }
  
  if (message.includes("organize") || message.includes("organizing") || message.includes("organization")) {
    return "Looking to untangle your web of bookmarks? Here are some Spider-Sense approved tips:\n\n1. Create specific categories for different types of sites\n2. Use descriptive names for your bookmarks\n3. Regularly clean up bookmarks you no longer need\n4. Consider using color-coding or emoji in category names for visual organization\n\nNeed more specific organization advice?";
  }
  
  if (message.includes("category") || message.includes("categories") || message.includes("folder")) {
    return "Categories are your web-slinging tools for organizing bookmarks! Some effective category ideas:\n\n• Work/Professional Resources\n• Learning/Education\n• Entertainment\n• Shopping\n• Finance\n• Travel Planning\n• Recipes/Cooking\n• Health & Fitness\n\nDon't create too many categories though - that can make things harder to find!";
  }
  
  if (message.includes("tips") || message.includes("tricks") || message.includes("advice")) {
    return "Here are some spectacular bookmark management tips:\n\n1. Use the search function to quickly find bookmarks\n2. Add new bookmarks immediately to their proper category\n3. Review your collection monthly to remove outdated sites\n4. For temporary bookmarks, create a 'To Read' or 'Temporary' category\n5. Use clear, descriptive names that will make sense to you later\n\nRemember: with great bookmark power comes great organizational responsibility!";
  }
  
  if (message.includes("delete") || message.includes("remove")) {
    return "Want to clean up your bookmark collection? Smart move! Here's how to approach deleting bookmarks:\n\n1. Start by reviewing your oldest bookmarks first\n2. Ask yourself if you've used the site in the last 6 months\n3. Consider if the information is outdated or still relevant\n4. For sites you're unsure about, move them to a 'Maybe' category for later review\n\nRegular cleanup keeps your bookmark collection swinging smoothly through the web!";
  }
  
  if (message.includes("import") || message.includes("export") || message.includes("backup")) {
    return "While SpiderBookmarks doesn't currently have import/export functionality, it's a great feature idea! Backing up your data is always a wise move. When this feature is implemented, you'll be able to save your bookmarks and categories for safekeeping or transfer them between devices.";
  }
  
  if (message.includes("password") || message.includes("login") || message.includes("security")) {
    return "For security reasons, I don't have access to your passwords or login credentials - that's your secret identity! SpiderBookmarks stores your bookmark information securely, but always remember to use strong, unique passwords for your accounts. Consider using a dedicated password manager for storing sensitive login information.";
  }
  
  if (message.includes("feature") || message.includes("suggestion") || message.includes("improve")) {
    return "Thanks for thinking about improving SpiderBookmarks! Some potential future features might include:\n\n• Tag-based organization in addition to categories\n• Bookmark thumbnail previews\n• Browser extensions for one-click saving\n• Bookmark sharing capabilities\n• Reading list integration\n\nYour feedback helps make the app better for everyone!";
  }
  
  // Default response if no specific pattern is matched
  return "That's an interesting question about bookmarks! While I'm running in fallback mode right now, I'd be happy to help with organizing your bookmarks, suggesting categories, or providing tips for better bookmark management. Is there anything specific about your bookmark collection you'd like assistance with?";
}