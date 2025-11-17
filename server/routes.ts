import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes removed - using localStorage on client side
  // Server now only serves static files
  
  const httpServer = createServer(app);
  return httpServer;
}
