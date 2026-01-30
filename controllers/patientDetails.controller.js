const {
  getPatientProfileService,
} = require("../services/patientProfile.service");

exports.getPatientProfile = async (req, res) => {
  try {
    const { patient_id } = req.params;

    const { user, profile } =
      await getPatientProfileService(patient_id);

    return res.json({
      success: true,
      data: {
        token: req.headers.authorization || null,
        role: "patient",
        user,
        profile,
        errorcode: null,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      success: false,
      data: {
        token: null,
        role: "patient",
        user: null,
        profile: null,
        errorcode: error.message || "UNKNOWN_ERROR",
      },
    });
  }
};
