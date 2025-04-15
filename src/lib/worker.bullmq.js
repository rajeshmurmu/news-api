import { Worker } from "bullmq";
import {
  UPSTASH_REDIS_URL,
  DEFAULT_REMOVE_CONFIG,
  EMAIL_QUEUE_NAME,
} from "../config/bullmq.config.js";
import { sendMail } from "./mailtrap.email.js";

// * EMAIL WORKER

// process job
const processEmailQueueData = async (job) => {
  try {
    // process email
    console.log(`Processing job with data: ${JSON.stringify(job?.data)}`);
    await sendMail(job?.data);
  } catch (error) {
    console.log("Error processEmailQueueData", error);
  }
};

// setup worker
export const emailWorker = new Worker(EMAIL_QUEUE_NAME, processEmailQueueData, {
  connection: {
    url: UPSTASH_REDIS_URL,
  },
  DEFAULT_REMOVE_CONFIG,
  autorun: true,
});

// worker listeners
emailWorker.on("completed", (job) => {
  console.debug(`Completed job with id ${job.id}`);
});

emailWorker.on("active", (job) => {
  console.debug(`Completed job with id ${job.id}`);
});
emailWorker.on("error", (failedReason) => {
  console.error(`Job encountered an error`, failedReason);
});

emailWorker.on("failed", (job) => {
  console.error(`Job failed with reason: ${job.failedReason}`);
});

emailWorker.on("ready", () => {
  console.debug("Email Worker is ready...");
});
