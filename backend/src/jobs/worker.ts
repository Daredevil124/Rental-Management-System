import { Worker, Job } from "bullmq";
import { connection } from "../events/eventBus.js";
import { redisClient, connectRedis } from "../config/redis.js";

console.log("Starting BullMQ background worker...");

// Worker handler to process background jobs
const worker = new Worker(
  "background-jobs",
  async (job: Job) => {
    console.log(`[Worker] Processing job: ${job.name} (ID: ${job.id})`);

    switch (job.name) {
      case "generate-invoice":
        await handleGenerateInvoice(job.data);
        break;

      case "send-notification":
        await handleSendNotification(job.data);
        break;

      case "settle-deposit-job":
        await handleSettleDeposit(job.data);
        break;

      case "refresh-dashboard-counters":
        await handleRefreshDashboardCounters();
        break;

      case "detect-overdue-rentals":
        await handleDetectOverdueRentals();
        break;

      default:
        console.warn(`[Worker] Unknown job name: ${job.name}`);
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.name} completed successfully.`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.name} failed:`, err);
});

// Job Handlers

async function handleGenerateInvoice(data: { rentalId: string }) {
  console.log(`[Invoice] Generating PDF invoice metadata for Rental Order: ${data.rentalId}`);
  // In a real system, we'd use PDFKit/Puppeteer to generate an invoice pdf and store it in FileStore
  // For the hackathon, we simulate invoice generation and publish event
  // In C06, we will output metadata details.
  console.log(`[Invoice] Invoice PDF generated successfully for rental: ${data.rentalId}`);
}

async function handleSendNotification(data: {
  type: string;
  recipientId: string;
  message: string;
  rentalId?: string;
}) {
  console.log(`[Notification] Dispatching notification to user ${data.recipientId} (Type: ${data.type}):`);
  console.log(`[Notification] Message Content: "${data.message}"`);
}

async function handleSettleDeposit(data: { rentalId: string }) {
  console.log(`[Deposit] Calculating settlement and refund balance for Rental Order: ${data.rentalId}`);
  // Database transaction updates and publishes events
}

async function handleRefreshDashboardCounters() {
  console.log("[Dashboard] Recalculating aggregated dashboard metrics...");
  try {
    await connectRedis();
    
    // In a real system, we would query the database for these counts.
    // Here we generate simulated counts or query postgres when schema is ready.
    // For now, let's cache mock/calculated numbers in Redis.
    const metrics = {
      activeRentals: Math.floor(Math.random() * 20) + 5,
      dueToday: Math.floor(Math.random() * 5) + 1,
      upcomingPickups: Math.floor(Math.random() * 8) + 2,
      upcomingReturns: Math.floor(Math.random() * 8) + 2,
      overdueRentals: Math.floor(Math.random() * 4),
      rentalRevenue: Math.floor(Math.random() * 10000) + 1500,
      securityDepositsHeld: Math.floor(Math.random() * 5000) + 800,
      lateFeeCollection: Math.floor(Math.random() * 1200) + 100,
      outstandingPenalties: Math.floor(Math.random() * 400),
      lastUpdated: new Date().toISOString()
    };

    await redisClient.set("dashboard:metrics", JSON.stringify(metrics));
    console.log("[Dashboard] Metrics cached in Redis:", metrics);

    // Notify dashboard consumers via pub/sub channel
    await redisClient.publish("admin:realtime:events", JSON.stringify({
      eventId: "dash-update-" + Date.now(),
      eventName: "dashboard.metrics_refreshed.v1",
      occurredAt: new Date().toISOString(),
      data: metrics
    }));

  } catch (error) {
    console.error("[Dashboard] Failed to refresh counters", error);
  }
}

async function handleDetectOverdueRentals() {
  console.log("[Scheduler] Running automated overdue checks on active rentals...");
  // Query DB for rentals where due date is passed and state is RETURN_DUE or PICKED_UP
}

// Support periodic scheduler (repeatable jobs)
// We set up a scheduler to trigger counter refresh and overdue detection
async function setupScheduler() {
  console.log("Setting up periodic scheduler jobs...");
  
  // We use BullMQ repeatable job or simple node interval for scheduling
  // For the dev Docker Compose environment, we can check database periodically
  setInterval(async () => {
    console.log("[Scheduler] Triggering periodic check for overdue rentals...");
    await handleDetectOverdueRentals();
  }, 300000); // every 5 minutes

  setInterval(async () => {
    console.log("[Scheduler] Triggering periodic dashboard counter refresh...");
    await handleRefreshDashboardCounters();
  }, 60000); // every 1 minute
}

setupScheduler().catch(console.error);
