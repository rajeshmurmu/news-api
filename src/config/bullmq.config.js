// Queue config
export const UPSTASH_REDIS_HOST = process.env.UPSTASH_REDIS_HOST;
export const UPSTASH_REDIS_PORT = process.env.UPSTASH_REDIS_PORT
  ? parseInt(process.env.UPSTASH_REDIS_PORT)
  : 6379;

export const UPSTASH_REDIS_URL = process.env.UPSTASH_REDIS_URL;

export const EMAIL_QUEUE_NAME = "email-queue";

export const DEFAULT_REMOVE_CONFIG = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000,
  },
  removeOnComplete: {
    age: 5000,
    count: 5,
  },
  removeOnFail: {
    age: 10000,
    count: 10,
  },
};
