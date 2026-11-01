import axios from "axios";
import nodemailer from "nodemailer";
import { ClassResponse } from "../utils/ClassResponse.js";

class Notification {
  async emailSender(recipent, subject, text) {
    // Create a transporter using your SMTP server configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: "No-Reply <info.thegaallery@gmail.com>", // Sender address
      to: recipent,
      subject: subject, // Subject line
      html: text, // Plain text body
    };

    await transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return ClassResponse(false, 500, "Email sent failed")
      }
    });

    return ClassResponse(true, 200, "Email has been sent")
  }
}

export const notificationClass = new Notification()