import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

export const sendMail = async ({ to, subject, html }) => {
  const message_info = {
    from: process.env.MAILTRAP_FROM,
    to: to,
    subject: subject,
    html: html,
  };

  const info = await transport.sendMail(message_info);
  console.log(`Message sent successfully ${info.messageId}`);
};
