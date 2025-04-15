import { Queue } from "bullmq";
import {
  EMAIL_QUEUE_NAME,
  UPSTASH_REDIS_URL,
  DEFAULT_REMOVE_CONFIG,
} from "../config/bullmq.config.js";

// EMAIL QUEUE
export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: {
    url: UPSTASH_REDIS_URL,
  },
});

// method to add job to email queue
export async function addEmailToQueue(data) {
  return emailQueue.add(EMAIL_QUEUE_NAME, data, DEFAULT_REMOVE_CONFIG);
}
