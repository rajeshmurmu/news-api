import vine from "@vinejs/vine";
import { CustomValidationError } from "./CustomValidationError.js";

vine.errorReporter = () => new CustomValidationError();

export const newsSchema = vine.object({
  title: vine.string().minLength(6).maxLength(255),
  content: vine.string().minLength(10), // for development it is 10 in production it should be 255 or above
});
