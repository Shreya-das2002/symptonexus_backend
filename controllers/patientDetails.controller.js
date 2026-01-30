const patientProfileService = require("../services/patientProfile.service");

class PatientDetailsController {
  async savePatientProfile(req, res) {
    try {
      console.log("REQUEST BODY:", req.body); // debug

      /* ================= PAYLOAD DATA ================= */
      const { patient_id } = req.body;

      // validation
      if (!patient_id) {
        return res.status(400).json({
          success: false,
          data: {
            errorcode: "PATIENT_ID_REQUIRED",
          },
        });
      }

      /* ================= SERVICE ================= */
      // ✅ CALL METHOD, NOT THE INSTANCE
      const { user, profile } =
        await patientProfileService.savePatientProfile(req.body);

      /* ================= RESPONSE ================= */
      return res.status(200).json({
        success: true,
        data: {
          message: "Patient profile saved successfully",
          user,
          profile,
        },
      });

    } catch (error) {
      console.error("SAVE PROFILE ERROR:", error.message);

      return res.status(500).json({
        success: false,
        data: {
          errorcode: error.message || "INTERNAL_SERVER_ERROR",
        },
      });
    }
  }
}

module.exports = new PatientDetailsController();
