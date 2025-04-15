import db from "../db/db.config.js";
import vine, { errors } from "@vinejs/vine";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  loginSchema,
  registerSchema,
} from "../validations/auth.validations.js";
import { eq } from "drizzle-orm";
import { usersTable } from "../db/schema/userSchema.js";
import { sendMail } from "../lib/mailtrap.email.js";
import { addEmailToQueue } from "../lib/queue.bullmq.js";

class AuthController {
  static async register(req, res) {
    try {
      const data = req.body;

      // Validate request body
      const validator = vine.compile(registerSchema);
      const payload = await validator.validate(data);

      const existingUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, payload.email));

      if (existingUser.length > 0) {
        return res
          .status(400)
          .json({ success: true, message: "User already exists" });
      }
      // Hash password before saving
      const hashedPassword = await bcrypt.hash(payload.password, 10);

      await db.insert(usersTable).values({
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
      });

      // send verification email TODO

      return res
        .status(201)
        .json({ success: true, message: "Account created successfully" });
    } catch (error) {
      // Handle validation errors
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ success: false, error: error.messages });
      }
      console.log("Error registering user", error);
      return res.status(500).json({
        success: false,
        message: "Error registering user, Please try again.",
        error,
      });
    }
  }

  static async login(req, res) {
    try {
      const data = req.body;

      // validate the data
      const validator = vine.compile(loginSchema);
      const payload = await validator.validate(data);

      // find user in the database
      const getUsers = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, payload.email));

      const user = getUsers[0];
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Invalid credentials" });
      }

      // verify password
      const is_verified = await bcrypt.compare(payload.password, user.password);
      //   console.log(is_verified);
      if (!is_verified) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid credentials" });
      }

      // remove user password
      delete user.password;

      // create access token
      const access_token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: 30 * 24 * 60 * 60, // 30 day
      });

      const cookie_options = {
        httpOnly: true,
        secure: true,
      };

      return res
        .status(200)
        .cookie("access_token", access_token, cookie_options)
        .json({
          success: true,
          message: "Login successfuly.",
          user,
          access_token,
        });
    } catch (error) {
      // Handle validation errors
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ success: false, error: error.messages });
      }
      console.log("Error logging in user", error);
      return res.status(500).json({
        success: false,
        message: "Error logging in, Please try again.",
        error,
      });
    }
  }

  static async logout(req, res) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(403).json({ success: false, message: "Bad request" });
      }

      // if storing refresh token in database clear it

      const cookie_options = {
        httpOnly: true,
        secure: true,
      };

      return res
        .status(200)
        .clearCookie("access_token", cookie_options)
        .json({ success: true, message: "Logout Successfully." });
    } catch (error) {
      console.log("Error logout user", error);
      return res.status(500).json({
        success: false,
        message: "Error logout, Please try again.",
        error,
      });
    }
  }

  static async sendEmail(req, res) {
    try {
      // add email to queue
      // const payload = [
      //   {
      //     to: req.body.email,
      //     subject: "Test email using queue",
      //     html: "<h1>Hello This is test email from news api</h1>",
      //   },
      //   {
      //     to: req.body.email,
      //     subject: "This is test email with queue",
      //     html: "<h1>Hello This is test email from news api</h1>",
      //   },
      //   {
      //     to: req.body.email,
      //     subject: "Test email Successfully delivered with queue",
      //     html: "<h1>Hello This is test email from news api</h1>",
      //   },
      //   {
      //     to: req.body.email,
      //     subject: "Hey this is amamzing",
      //     html: "<h1>Hello This is test email from news api</h1>",
      //   },
      // ];

      const payload = {
        to: req.body.email,
        subject: "Test email using queue,this is awesome",
        html: "<h1>Hello This is test email from news api</h1>",
      };
      await addEmailToQueue(payload);

      // send email
      // await sendMail({
      //   to: req.body.email,
      //   subject: "Test email",
      //   html: "<h1>Hello This is test email from news api</h1>",
      // });
      return res.status(200).json({
        success: true,
        message: "Email sent successfully.",
      });
    } catch (error) {
      console.log("Error sending email", error);
      return res.status(500).json({
        success: false,
        error: "Error sending email, Please try again.",
      });
    }
  }
}

export default AuthController;
