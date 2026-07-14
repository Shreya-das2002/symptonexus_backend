const nodemailer = require("nodemailer");

/* ================= SERVICE ================= */

class ContactEmailService {
  constructor() {
    this.EMAIL_USER = process.env.EMAIL_USER;
    this.EMAIL_PASS = process.env.EMAIL_PASS;

    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: this.EMAIL_USER,
        pass: this.EMAIL_PASS,
      },
    });
  }

  /* ================= MAIN METHOD ================= */

  async sendContactMessage(contactData) {
    try {
      const { name, email, message } = contactData;

      /* ================= VALIDATION ================= */

      if (!name || !email || !message) {
        throw new Error("ALL_FIELDS_REQUIRED");
      }

      /* ================= SEND EMAILS ================= */

      await Promise.all([
        this._sendAdminEmail({ name, email, message }),
        this._sendUserConfirmationEmail({ name, email }),
      ]);

      return {
        success: true,
        message: "Contact message sent successfully",
      };
    } catch (error) {
      console.error("CONTACT_EMAIL_SERVICE_ERROR:", error);
      throw error;
    }
  }

  /* ================= ADMIN EMAIL ================= */

  async _sendAdminEmail({ name, email, message }) {
    try {
      return await this.transporter.sendMail({
        from: this.EMAIL_USER,
        replyTo: email,
        to: this.EMAIL_USER,
        subject: "New Contact Message - SymptoNexus",
        html: `
          <h2>New Contact Message</h2>

          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>

          <h3>Message:</h3>
          <p>${message}</p>

          <br/>

          <p>This message was submitted from the SymptoNexus contact form.</p>
        `,
      });
    } catch (error) {
      console.error("CONTACT_ADMIN_EMAIL_ERROR:", error);
      throw error;
    }
  }

  /* ================= USER CONFIRMATION EMAIL ================= */

  async _sendUserConfirmationEmail({ name, email }) {
    try {
      return await this.transporter.sendMail({
        from: this.EMAIL_USER,
        to: email,
        subject: "Message Received - SymptoNexus",
        html: `
          <h2>Dear ${name},</h2>

          <p>Thank you for contacting <b>SymptoNexus</b>.</p>

          <p>We have received your message successfully. Our team will review your query and get back to you shortly.</p>

          <p>We usually respond within 24 hours.</p>

          <br/>

          <p>Best Regards,</p>
          <p><b>SymptoNexus Team</b></p>
        `,
      });
    } catch (error) {
      console.error("CONTACT_CONFIRMATION_EMAIL_ERROR:", error);
      throw error;
    }
  }
}

module.exports = new ContactEmailService();