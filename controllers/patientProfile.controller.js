const patientProfileService = require("../services/patientProfile.service");

class PatientProfileController {

  async getProfile(req, res) {
    try {
      const patient_id = req.user.patient_id;

      const profile = await patientProfileService.getProfile(patient_id);

      if (!profile) {
        return res.sendResponse(
          res.STATUS.NOT_FOUND,
          "Profile not found"
        );
      }

      return res.sendResponse(
        res.STATUS.SUCCESS,
        "Profile fetched successfully",
        profile
      );

    } catch (err) {
      console.error(err);
      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Failed to load profile"
      );
    }
  }

  async saveProfile(req, res) {
    try {
      const patient_id = req.user.patient_id;

      await patientProfileService.saveProfile(patient_id, req.body);

      return res.sendResponse(
        res.STATUS.SUCCESS,
        "Profile updated successfully"
      );

    } catch (err) {
      console.error(err);
      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Failed to save profile"
      );
    }
  }
}

module.exports = new PatientProfileController();
