import vine from "@vinejs/vine";
import { CustomValidationError } from "./CustomValidationError.js";

// add custom error reporter or validation error reporter
vine.errorReporter = () => new CustomValidationError();

export const registerSchema = vine.object({
  name: vine.string().minLength(3).maxLength(199),
  email: vine.string().email(),
  password: vine.string().minLength(8).maxLength(199).confirmed(),
});

export const loginSchema = vine.object({
  email: vine.string().email(),
  password: vine.string(),
});
