import { eq } from "drizzle-orm";
import db from "../db/db.config.js";
import { usersTable } from "../db/schema/userSchema.js";
import { validateImage } from "../lib/helper.js";
import fs from "node:fs";

class ProfileController {
  static async index(req, res) {
    try {
      const authUser = req.user;

      if (!authUser)
        return res
          .status(404)
          .json({ success: false, message: "Profile not found" });

      const getUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, authUser.id));

      const user = getUser[0];

      return res
        .status(200)
        .json({ success: false, user, message: "Profile fetch successfully." });
    } catch (error) {
      console.log("Error get profile", error);
      return res.status(500).json({
        success: false,
        message: "Error getting profile, Please try again.",
        error,
      });
    }
  }
  static async store() {}
  static async show() {}
  static async update(req, res) {
    try {
      const user = req.user;
      const file = req.file;
      //   console.log("file", file);

      if (!file || Object.keys(req.file).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Profile image is required,Please provide an image.",
        });
      }

      const validateFile = validateImage(file.size, file.mimetype);
      //   console.log("validate", validateFile);
      if (validateFile !== null) {
        // if file validation success it reuturn null
        // delete file
        fs.unlinkSync(req.file?.path);
        return res.status(203).json({
          success: false,
          message: validateFile || "Invalid image size or image type.",
        });
      }
      const avatar = file?.path?.replace("public", "");

      await db
        .update(usersTable)
        .set({
          avatar: avatar,
        })
        .where(eq(usersTable.email, user?.email));

      return res.status(200).json({
        success: true,
        message: "Avatar updated successfully",
      });
    } catch (error) {
      console.log("Error update profile", error);
      return res.status(500).json({
        success: false,
        message: "Error update profile, Please try again.",
        error,
      });
    }
  }
  static async destroy() {}
}

export default ProfileController;
