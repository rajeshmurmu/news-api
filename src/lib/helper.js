import fs from "node:fs";
import {
  STATIC_DIR,
  SUPPORTED_MIMETYPES,
  UPLOAD_IMAGE_SIZE_LIMIT,
} from "../config/app.config.js";

export const bytesToMb = (bytes) => {
  return bytes / (1024 * 1024);
};

export const validateImage = (size, mimetype) => {
  if (bytesToMb(size) > UPLOAD_IMAGE_SIZE_LIMIT)
    return "Image size must be less than 2 MB";

  if (!SUPPORTED_MIMETYPES.includes(mimetype))
    return "Image should be in png,jpg,jpeg,webp,avif,gif,svg format.";

  return null;
};

export const deleteImage = async (image_id) => {
  try {
    const path = STATIC_DIR + image_id;
    // check file is exist or not
    if (!fs.existsSync(path)) return false;
    fs.unlinkSync(path);

    return true;
  } catch (error) {
    console.log("Error delete image", error);
  }
};
