import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  //   windowMs: 1 * 60 * 1000, // 1 minutes
  limit: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // disable the `X-RateLimit-*` headers
});
