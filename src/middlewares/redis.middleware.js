import { generateCacheKey, redisClient } from "../config/redis.config.js";
// redis middleware
export const useRedisLData = async (req, res, next) => {
  try {
    const cacheKey = generateCacheKey(req);
    const cachedData = await redisClient.LRANGE(cacheKey, 0, -1);

    if (cachedData.length > 0) {
      // send cache data
      return res.json(JSON.parse(cachedData));
    }
    next();
  } catch (error) {
    console.log("Error to use redis", error);
  }
};
