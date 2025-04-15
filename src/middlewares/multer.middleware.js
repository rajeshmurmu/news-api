import multer from "multer";
import { validateImage } from "../lib/helper.js";
import { UPLOAD_IMAGE_SIZE_LIMIT } from "../config/app.config.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, "./public/temp/images"); // if uplaoding to the cloudinary or aws

    cb(null, "./public/images"); // keep file in local
  },

  filename: async function (req, file, cb) {
    cb(null, "avatar" + crypto.randomUUID() + file.originalname);
  },
});

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: UPLOAD_IMAGE_SIZE_LIMIT, // 2 MB
  },
  fileFilter: function (req, file, cb) {
    // validate the image
    const is_valid_image = validateImage(file.size, file.mimetype);
    if (is_valid_image === null) {
      return cb(null, true);
    }

    // return error message if image is not valid
    return cb(new Error(is_valid_image), false);
  },
});
