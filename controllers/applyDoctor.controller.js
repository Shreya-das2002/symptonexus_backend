const applyDoctorService = require("../services/applyDoctor.service");

const applyDoctor = async (req, res) => {

  try {

    const { name, specialization, email, phone } = req.body;

    const cvFile = req.file;

    if (!name || !specialization || !email || !phone || !cvFile) {

      return res.status(400).json({

        success: false,

        message: "All fields and CV required"

      });

    }

    await applyDoctorService.sendDoctorApplicationEmail(
      { name, specialization, email, phone },
      cvFile
    );

    return res.status(200).json({

      success: true,

      message: "Application sent successfully"

    });

  }

  catch (error) {

    console.log(error);

    return res.status(500).json({

      success: false,

      message: "Email failed"

    });

  }

};

module.exports = {
  applyDoctor
};
