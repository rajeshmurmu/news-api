import { generateCacheKey, redisClient } from "../config/redis.config.js";

// get data from redis
export const getRedisLData = async (req, key) => {
  try {
    const cacheKey = generateCacheKey(req);
    const cachedData = await redisClient.LRANGE(cacheKey, 0, -1);

    if (cachedData.length > 0) {
      // send cache data
      return res.json(JSON.parse(cachedData));
    }
  } catch (error) {
    console.log("Error to use redis", error);
  }
};

// set data to redis
export const setRedisLData = async (req, data) => {
  try {
    const cacheKey = generateCacheKey(req);
    await redisClient.rPush(cacheKey, JSON.stringify(data));
  } catch (error) {
    console.log("Error to set redis", error);
  }
};

// delete any data from redis
export const deleteNewsDataFromRedis = async (req) => {
  try {
    const cacheKey = "api:v1:news*";
    // const cacheKey = generateCacheKey(req);
    await redisClient.DEL(cacheKey);
  } catch (error) {
    console.log("Error to delete redis", error);
  }
};

// clear all data from redis
export const clearAllRedisData = async () => {
  try {
    await redisClient.flushAll();
  } catch (error) {
    console.log("Error to clear redis", error);
  }
};

class RedisNewsDataHelper {
  static async set_news_with_id(req, data) {
    try {
      const cacheKey = generateCacheKey(req);
      await redisClient.set(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.log("Error set_news_with_id", error);
    }
  }
  static async get_news_with_id(req) {
    try {
      // TODO it can be improve by sending key when function call because it call many times genrateCacheKey to generate key it can be done with generate once and pass it in function parameter
      const cacheKey = generateCacheKey(req);
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        // send cache data
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.log("Error get_news_with_id", error);
    }
  }
  static async delete_news_with_id(req) {
    try {
      const cacheKey = generateCacheKey(req);

      await redisClient.DEL(cacheKey);
    } catch (error) {
      console.log("Error delete_news_with_id", error);
    }
  }

  static async set_all_news(req, data) {
    try {
      const key = generateCacheKey(req);
      await redisClient.set(key, JSON.stringify(data));
    } catch (error) {
      console.log("Error set_all_news", error);
    }
  }

  static async get_all_news(req) {
    try {
      const key = generateCacheKey(req);
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        // send cache data
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.log("Error get_all_news", error);
    }
  }

  static async delete_all_news() {
    try {
      const keys = await redisClient.keys("api:v1:news:?:*");
      console.log(keys);
      await redisClient.DEL([...keys, "api:v1:news"]);
    } catch (error) {
      console.log("Error delete_all_news", error);
    }
  }

  static async clear_all_news_keys() {
    try {
      const cacheKey = "api:v1:news*";
      const keys = await redisClient.keys(cacheKey);

      if (keys.length > 0) {
        await redisClient.DEL(keys);
      }
    } catch (error) {
      console.log("Error clear_all_news", error);
    }
  }
  static clear_all_data = clearAllRedisData;
}

export default RedisNewsDataHelper;
