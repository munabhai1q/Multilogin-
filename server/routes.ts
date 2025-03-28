import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookmarkSchema, insertCategorySchema } from "@shared/schema";
import { setupAuth } from "./auth";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { getChatCompletion } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Categories endpoints
  app.get("/api/categories", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const categories = await storage.getCategories(userId);
    res.json(categories);
  });

  app.post("/api/categories", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const categoryData = insertCategorySchema.parse({ ...req.body, userId });
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "An error occurred creating the category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const categoryId = parseInt(req.params.id);
    const category = await storage.getCategoryById(categoryId);
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    if (category.userId !== req.user!.id) {
      return res.status(403).json({ message: "Not authorized to delete this category" });
    }
    
    const success = await storage.deleteCategory(categoryId);
    if (success) {
      res.status(200).json({ message: "Category deleted successfully" });
    } else {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Bookmarks endpoints
  app.get("/api/bookmarks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    
    let bookmarks;
    if (categoryId) {
      const category = await storage.getCategoryById(categoryId);
      if (!category || category.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to access this category" });
      }
      bookmarks = await storage.getBookmarksByCategory(categoryId);
    } else {
      bookmarks = await storage.getBookmarks(userId);
    }
    
    res.json(bookmarks);
  });

  app.get("/api/bookmarks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const bookmarkId = parseInt(req.params.id);
    const bookmark = await storage.getBookmarkById(bookmarkId);
    
    if (!bookmark) {
      return res.status(404).json({ message: "Bookmark not found" });
    }
    
    if (bookmark.userId !== req.user!.id) {
      return res.status(403).json({ message: "Not authorized to access this bookmark" });
    }
    
    res.json(bookmark);
  });

  app.post("/api/bookmarks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      
      // If a categoryId is provided, ensure it belongs to the user
      if (req.body.categoryId) {
        const categoryId = parseInt(req.body.categoryId);
        const category = await storage.getCategoryById(categoryId);
        if (!category || category.userId !== userId) {
          return res.status(403).json({ message: "Not authorized to use this category" });
        }
      }
      
      const bookmarkData = insertBookmarkSchema.parse({ ...req.body, userId });
      const bookmark = await storage.createBookmark(bookmarkData);
      res.status(201).json(bookmark);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "An error occurred creating the bookmark" });
    }
  });

  app.put("/api/bookmarks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const bookmarkId = parseInt(req.params.id);
    const bookmark = await storage.getBookmarkById(bookmarkId);
    
    if (!bookmark) {
      return res.status(404).json({ message: "Bookmark not found" });
    }
    
    if (bookmark.userId !== req.user!.id) {
      return res.status(403).json({ message: "Not authorized to update this bookmark" });
    }
    
    // If changing category, verify ownership
    if (req.body.categoryId && req.body.categoryId !== bookmark.categoryId) {
      const categoryId = parseInt(req.body.categoryId);
      const category = await storage.getCategoryById(categoryId);
      if (!category || category.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to use this category" });
      }
    }
    
    try {
      const updated = await storage.updateBookmark(bookmarkId, req.body);
      if (updated) {
        res.json(updated);
      } else {
        res.status(500).json({ message: "Failed to update bookmark" });
      }
    } catch (error) {
      res.status(500).json({ message: "An error occurred updating the bookmark" });
    }
  });

  app.delete("/api/bookmarks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const bookmarkId = parseInt(req.params.id);
    const bookmark = await storage.getBookmarkById(bookmarkId);
    
    if (!bookmark) {
      return res.status(404).json({ message: "Bookmark not found" });
    }
    
    if (bookmark.userId !== req.user!.id) {
      return res.status(403).json({ message: "Not authorized to delete this bookmark" });
    }
    
    const success = await storage.deleteBookmark(bookmarkId);
    if (success) {
      res.status(200).json({ message: "Bookmark deleted successfully" });
    } else {
      res.status(500).json({ message: "Failed to delete bookmark" });
    }
  });

  // Ollama AI Assistant endpoint
  app.post("/api/chat", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ 
          message: "Invalid request format. Expected an array of messages." 
        });
      }

      // Add user context to help with bookmark-related queries
      const userContext = {
        role: "system",
        content: "You are WebSense, an AI assistant for SpiderBookmarks, a bookmark management application. Your purpose is to help users organize their bookmarks efficiently and provide tips for better web browsing productivity. You have a friendly, helpful personality with a touch of Spider-Man themed humor. When appropriate, include Spider-Man references or web-related puns in your responses. Keep responses concise and focused on helping the user manage their digital web of bookmarks."
      };
      
      const allMessages = [userContext, ...messages];
      
      // Get response from Ollama
      const response = await getChatCompletion(allMessages);
      
      res.json(response);
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ 
        message: "An error occurred while processing your request",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
