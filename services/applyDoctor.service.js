const nodemailer = require("nodemailer");

const sendDoctorApplicationEmail = async (doctorData, cvFile) => {

  try {

    const transporter = nodemailer.createTransport({

      service: "gmail",

      auth: {

        user: "symptonexus333@gmail.com",

        pass: "luly jpjk spww kaop"

      }

    });

    const mailOptions = {

      from: doctorData.email,

      to: "symptonexus333@gmail.com",

      subject: "New Doctor Application",

      text: `
Doctor Application Details:

Name: ${doctorData.name}

Specialization: ${doctorData.specialization}

Email: ${doctorData.email}

Phone: ${doctorData.phone}
      `,

      attachments: [
        {
          filename: cvFile.originalname,
          content: cvFile.buffer
        }
      ]

    };

    const result = await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: "Email sent successfully",
      data: result
    };

  }

  catch (error) {

    console.error("Email Service Error:", error);

    throw new Error("Failed to send doctor application email");

  }

};

module.exports = {
  sendDoctorApplicationEmail
};
