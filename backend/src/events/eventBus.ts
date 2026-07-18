import { redisClient, connectRedis } from "../config/redis.js";
import { Queue } from "bullmq";
import { Redis } from "ioredis";

// Event names as defined in project standards
export type DomainEventName =
  | "auth.user_registered.v1"
  | "rental.created.v1"
  | "rental.confirmed.v1"
  | "rental.pickup_scheduled.v1"
  | "rental.picked_up.v1"
  | "rental.return_due.v1"
  | "rental.overdue.v1"
  | "rental.returned.v1"
  | "deposit.collected.v1"
  | "deposit.settled.v1"
  | "late_fee.calculated.v1"
  | "invoice.generated.v1"
  | "inventory.reserved.v1"
  | "inventory.released.v1"
  | "notification.requested.v1";

export interface DomainEvent<T = any> {
  eventId: string;
  eventName: DomainEventName;
  occurredAt: string;
  actorId?: string;
  data: T;
}

const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = parseInt(process.env.REDIS_PORT || "6379", 10);
const redisPassword = process.env.REDIS_PASSWORD || undefined;

// Redis client for BullMQ (BullMQ requires ioredis)
export const connection = new Redis({
  host: redisHost,
  port: redisPort,
  password: redisPassword,
  maxRetriesPerRequest: null, // Critical configuration for BullMQ
});

// BullMQ Queue for processing background jobs
export const backgroundQueue = new Queue("background-jobs", { connection });

// Redis Pub/Sub channel for realtime admin notifications
const REALTIME_CHANNEL = "admin:realtime:events";

export class EventBus {
  /**
   * Publish a domain event.
   * - Saves event to Redis Pub/Sub for SSE streaming
   * - Enqueues background jobs for events that require side-effects (e.g. notifications, invoices)
   */
  static async publish<T>(eventName: DomainEventName, data: T, actorId?: string): Promise<DomainEvent<T>> {
    const event: DomainEvent<T> = {
      eventId: Math.random().toString(36).substring(2) + Date.now().toString(36),
      eventName,
      occurredAt: new Date().toISOString(),
      actorId,
      data,
    };

    console.log(`[EventBus] Publishing event: ${eventName} (ID: ${event.eventId})`);

    try {
      // 1. Publish to Redis Pub/Sub for realtime dashboard consumers
      await connectRedis();
      await redisClient.publish(REALTIME_CHANNEL, JSON.stringify(event));

      // 2. Dispatch to background queues depending on the event type
      await this.routeToQueue(event);

    } catch (error) {
      console.error(`[EventBus] Failed to publish event: ${eventName}`, error);
    }

    return event;
  }

  /**
   * Routes events to BullMQ for asynchronous background processing.
   */
  private static async routeToQueue(event: DomainEvent): Promise<void> {
    switch (event.eventName) {
      case "rental.created.v1":
        // Generate invoice & schedule return reminders
        await backgroundQueue.add("generate-invoice", { rentalId: event.data.rentalId });
        break;

      case "rental.return_due.v1":
      case "rental.overdue.v1":
      case "notification.requested.v1":
        // Process email/sms notifications
        await backgroundQueue.add("send-notification", {
          type: event.eventName,
          recipientId: event.data.customerId || event.data.userId,
          message: event.data.message || "Action required regarding your rental.",
          rentalId: event.data.rentalId,
        });
        break;

      case "rental.returned.v1":
        // Settle deposit and calculate final fees
        await backgroundQueue.add("settle-deposit-job", { rentalId: event.data.rentalId });
        break;

      // Other events update live metrics in realtime counters
      case "rental.confirmed.v1":
      case "rental.picked_up.v1":
      case "deposit.collected.v1":
      case "deposit.settled.v1":
      case "late_fee.calculated.v1":
        await backgroundQueue.add("refresh-dashboard-counters", {});
        break;

      default:
        break;
    }
  }
}
export { REALTIME_CHANNEL };
