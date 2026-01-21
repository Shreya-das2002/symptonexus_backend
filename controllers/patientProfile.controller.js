const patientProfileService = require("../services/patientProfile.service");

class PatientProfileController {

  async getProfile(req, res) {
    try {
      const patient_id = req.user.patient_id;
      const profile = await patientProfileService.getProfile(patient_id);
      return res.success(profile);
    } catch (err) {
      console.error(err);
      return res.error("Failed to load profile");
    }
  }

  async saveProfile(req, res) {
    try {
      const patient_id = req.user.patient_id;
      await patientProfileService.saveProfile(patient_id, req.body);
      return res.success("Profile updated successfully");
    } catch (err) {
      console.error(err);
      return res.error("Failed to save profile");
    }
  }

}

module.exports = new PatientProfileController();
