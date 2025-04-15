import vine, { errors } from "@vinejs/vine";
import { newsSchema } from "../validations/news.validations.js";
import { deleteImage, validateImage } from "../lib/helper.js";
import db from "../db/db.config.js";
import { newsTable } from "../db/schema/newsSchema.js";
import { usersTable } from "../db/schema/userSchema.js";
import { desc, eq } from "drizzle-orm";
import { PER_PAGE_LIMIT, STATIC_DIR } from "../config/app.config.js";
import RedisNewsDataHelper, { setRedisLData } from "../lib/redis.helper.js";
class NewsController {
  static async index(req, res) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || PER_PAGE_LIMIT;

      if (page < 1 || limit < 1) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid page or limit" });
      }

      // get all news from redis database and return
      const news_from_redis = await RedisNewsDataHelper.get_all_news(req);

      if (news_from_redis) {
        return res.status(200).json({
          ...news_from_redis,
        });
      }

      // get all news from database with pagination
      const news = await db
        .select({
          id: newsTable.id,
          title: newsTable.title,
          content: newsTable.content,
          image: newsTable.image,
          author: {
            autor_id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
            avatar: usersTable.avatar,
          },
        })
        .from(newsTable)
        .orderBy(desc(newsTable.id))
        .leftJoin(usersTable, eq(usersTable.id, newsTable.user_id))
        .limit(page * limit) // data with limit 10 *10 = 100
        .offset((page - 1) * limit); // skip data (10-1) * 10 = 90

      if (!news) {
        return res
          .status(404)
          .json({ success: false, message: "News not found" });
      }

      // calculate tatal_news and total_pages
      const totalNews = await db.$count(newsTable);
      const totalPages = Math.ceil(totalNews / limit);

      if (news.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "News not found" });
      }

      const response = {
        success: true,
        news,
        message: "News fetch successfully.",
        metaData: {
          totalNews,
          totalPages,
          limit,
        },
      };

      // set data to redis database
      await RedisNewsDataHelper.set_all_news(req, response);

      return res.status(200).json(response);
    } catch (error) {
      // Handle validation errors
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ success: false, error: error.messages });
      }

      console.log("Error get news", error);
      return res.status(500).json({
        success: false,
        message: "Error fetch news, Please try again.",
        error,
      });
    }
  }
  static async store(req, res) {
    try {
      const user = req.user;
      const data = req.body;
      const file = req.file;

      // validate new data
      const validator = vine.compile(newsSchema);
      const payload = await validator.validate(data);

      if (!file || Object.keys(file).length === 0) {
        return res.status(400).json({
          success: false,
          errors: { image: "Image is required, please provide an image." },
        });
      }

      // validate Image
      const validImage = validateImage(file.size, file.mimetype);
      if (validImage !== null) {
        // if file validation success it reuturn null
        // delete file
        deleteImage(file?.path);
        return res.status(203).json({
          success: false,
          message: validImage || "Invalid image size or image type.",
        });
      }

      // remove the public folder or static_folder from the image path
      // and strore the image in the database
      const image = file?.path?.replace(STATIC_DIR, "");

      payload.image = image;
      payload.user_id = user.id;

      // create news in the database
      await db.insert(newsTable).values(payload);

      return res
        .status(200)
        .json({ success: true, message: "News added successfully." });
    } catch (error) {
      // Handle validation errors
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ success: false, error: error.messages });
      }

      console.log("Error post news", error);
      return res.status(500).json({
        success: false,
        message: "Error post news, Please try again.",
        error,
      });
    }
  }
  static async show(req, res) {
    try {
      const id = req.params.id;

      // get news from redis
      const news_from_redis = await RedisNewsDataHelper.get_news_with_id(req);

      if (news_from_redis) {
        return res.status(200).json({
          ...news_from_redis,
        });
      }

      // get news from database with user or author
      const news = await db
        .select({
          id: newsTable.id,
          title: newsTable.title,
          content: newsTable.content,
          image: newsTable.image,
          author: {
            autor_id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
            avatar: usersTable.avatar,
          },
        })
        .from(newsTable)
        .where(eq(newsTable.id, id))
        .innerJoin(usersTable, eq(usersTable.id, newsTable.user_id));

      if (news.length === 0 || !news) {
        return res
          .status(404)
          .json({ success: false, message: "News not found" });
      }

      const response = { success: true, news };

      // set data to redis database
      await RedisNewsDataHelper.set_news_with_id(req, response);

      return res.status(200).json(response);
    } catch (error) {
      console.log("Error get news", error);
      return res.status(500).json({
        success: false,
        message: "Error get news, Please try again.",
        error,
      });
    }
  }
  static async update(req, res) {
    try {
      const id = req.params.id;
      const data = req.body;
      const user = req.user;
      const file = req.file;

      // validate new data
      const validator = vine.compile(newsSchema);
      const payload = await validator.validate(data);

      // get specific user news from database
      const db_user_news = await db
        .select()
        .from(newsTable)
        .where(eq(newsTable.id, id))
        .innerJoin(usersTable, eq(usersTable.id, user?.id));

      if (db_user_news.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "News not found" });
      }

      payload.user_id = user.id;
      payload.image = file?.path?.replace(STATIC_DIR, "");
      // update news in database
      await db.update(newsTable).set(payload).where(eq(newsTable.id, id));

      // delete old image if new image is uploaded
      if (file?.path && db_user_news[0].news.image) {
        // delete old image
        await deleteImage(db_user_news[0].news.image);
      }

      // delete news from redis database
      await RedisNewsDataHelper.delete_news_with_id(req);

      return res
        .status(200)
        .json({ success: true, message: "News updated successfully." });
    } catch (error) {
      // Handle validation errors
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ success: false, error: error.messages });
      }
      console.log("Error update news", error);
      return res.status(500).json({
        success: false,
        message: "Error update news, Please try again.",
        error,
      });
    }
  }
  static async destroy(req, res) {
    try {
      const id = req.params.id;
      const user = req.user;

      // get specific user news from database
      const db_user_news = await db
        .select()
        .from(newsTable)
        .where(eq(newsTable.id, id))
        .innerJoin(usersTable, eq(usersTable.id, user?.id));

      if (db_user_news.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "News not found" });
      }

      // delete image from the local first
      if (db_user_news[0].news.image) {
        // delete old image
        await deleteImage(db_user_news[0].news.image);
      }

      // delete the news from the database
      await db.delete(newsTable).where(eq(newsTable.id, id));

      // delete news from redis database
      await RedisNewsDataHelper.delete_news_with_id(req);
      await RedisNewsDataHelper.delete_all_news();

      return res
        .status(200)
        .json({ success: true, message: "News deleted successfully." });
    } catch (error) {
      console.log("Error delete news", error);
      return res.status(500).json({
        success: false,
        message: "Error delete news, Please try again.",
        error,
      });
    }
  }
}

export default NewsController;
