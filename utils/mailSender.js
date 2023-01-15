import nodemailer from "nodemailer";
import pug from "pug";
import path from "path";
import { convert } from "html-to-text";

const __dirname = path.resolve();

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Ravi Manjhi <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "development") {
      return nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "6379388e0af82b",
          pass: "138c15ec8b0448",
        },
      });
    }

    return nodemailer.createTransport({
      host: "smtp-relay.sendinblue.com",
      port: 587,
      auth: {
        user: process.env.EMAIL_USER_ID,
        pass: process.env.EMAIL_API_KEY,
      },
    });
  }

  async send(template, subject) {
    // 1) render html based on a pub template

    const html = pug.renderFile(`${__dirname}/views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to nature Family!");
  }

  async passwordReset() {
    await this.send("passwordReset", "Reset your password");
  }
}

export default Email;
