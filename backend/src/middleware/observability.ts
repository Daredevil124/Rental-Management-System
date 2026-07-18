import { Request, Response, NextFunction } from "express";
import * as fs from "fs";
import * as path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDirectory = path.join(__dirname, "../../../logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}
const auditLogFile = path.join(logDirectory, "audit.log");

// Middleware to inject Request ID and log detailed incoming requests and duration
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime();
  
  // Ensure a Request ID exists
  const requestId = req.headers["x-request-id"] || Math.random().toString(36).substring(2) + Date.now().toString(36);
  req.headers["x-request-id"] = requestId;
  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    const logLine = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${timeInMs}ms - RequestID: ${requestId}\n`;
    
    // Log to console
    console.log(logLine.trim());
    
    // Optional: Write to file
    fs.appendFile(path.join(logDirectory, "access.log"), logLine, (err) => {
      if (err) console.error("Error writing access log", err);
    });
  });

  next();
}

// Function to write audit logs safely
export function writeAuditLog(action: string, actorId: string | undefined, details: any): void {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    action,
    actorId: actorId || "SYSTEM",
    details,
  };
  const logLine = JSON.stringify(auditEntry) + "\n";
  
  console.log(`[AUDIT] ${action} by ${actorId || "SYSTEM"}:`, details);
  
  fs.appendFile(auditLogFile, logLine, (err) => {
    if (err) console.error("Error writing audit log", err);
  });
}
