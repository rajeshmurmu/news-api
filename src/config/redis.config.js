import redis from "redis";

export const redisClient = await redis
  .createClient({
    url: process.env.UPSTASH_REDIS_URL,
    password: process.env.UPSTASH_REDIS_PASSWORD,
  })
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

// generate redis cache key
export const generateCacheKey = (req) => {
  // console.log(req.params);
  // console.log(Object.keys(req.query).sort());
  // console.log("baseUrl", req.baseUrl);
  // console.log("originalUrl", req.originalUrl);
  // console.log("req.params", req.params);
  // console.log("req.path", req.path);
  // console.log("req.pathname", req.absolutePath);

  const baseUrl = req.originalUrl.split("?")[0];
  const url = baseUrl.replace(/^\/+|\/+$/g, "").replace(/\//g, ":"); // /api/v1/product/1 -> api:v1:product:1

  // sort query params
  const queryParams = req.query;
  const sortedQueryParams = Object.keys(queryParams)
    .sort()
    .map((key) => `${key}=${queryParams[key]}`)
    .join("&");

  //   console.log(`${url}:${sortedQueryParams}`);

  return sortedQueryParams ? `${url}:?:${sortedQueryParams}` : url;
};
