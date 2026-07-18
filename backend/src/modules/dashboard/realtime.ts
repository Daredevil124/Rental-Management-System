import { Request, Response } from "express";
import { createClient } from "redis";
import { REALTIME_CHANNEL } from "../../events/eventBus.js";

const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = process.env.REDIS_PORT || "6379";
const redisPassword = process.env.REDIS_PASSWORD || "";

const redisUrl = redisPassword
  ? `redis://:${redisPassword}@${redisHost}:${redisPort}`
  : `redis://${redisHost}:${redisPort}`;

/**
 * Server-Sent Events (SSE) Endpoint for Realtime Dashboard Updates.
 * Exposes: GET /api/v1/admin/dashboard/events
 */
export async function handleDashboardEvents(req: Request, res: Response): Promise<void> {
  // Set headers for Server-Sent Events
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*", // Allow UI origins
  });

  // Send an initial handshake comment
  res.write("retry: 10000\n\n");
  res.write("event: connected\n");
  res.write(`data: ${JSON.stringify({ message: "SSE Dashboard Connection established" })}\n\n`);

  // Create a dedicated Redis subscriber client
  const subscriber = createClient({ url: redisUrl });
  
  subscriber.on("error", (err) => console.error("Realtime Redis Subscriber Error", err));

  try {
    await subscriber.connect();

    // Subscribe to the realtime event channel
    await subscriber.subscribe(REALTIME_CHANNEL, (message) => {
      // Forward the event from Redis Pub/Sub direct to the browser SSE stream
      res.write(`event: message\n`);
      res.write(`data: ${message}\n\n`);
    });

    console.log(`[SSE] Client connected. Active subscription to channel: ${REALTIME_CHANNEL}`);

  } catch (err) {
    console.error("[SSE] Failed to establish Redis subscriber connection", err);
    res.write("event: error\n");
    res.write(`data: ${JSON.stringify({ message: "Failed to connect to event broker" })}\n\n`);
    res.end();
    return;
  }

  // Monitor client disconnect to clean up Redis subscription resources
  req.on("close", async () => {
    console.log("[SSE] Client disconnected. Cleaning up Redis subscription...");
    try {
      if (subscriber.isOpen) {
        await subscriber.unsubscribe(REALTIME_CHANNEL);
        await subscriber.disconnect();
      }
    } catch (error) {
      console.error("[SSE] Error cleaning up Redis subscription client", error);
    }
  });
}
