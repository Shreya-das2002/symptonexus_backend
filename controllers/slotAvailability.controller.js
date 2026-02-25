const DoctorAvailabilityService = require("../services/slotAvailability.service");

class DoctorAvailabilityController {

  static async upsertSlot(req, res) {

    try {

      const { doctor_id, date, slot_count, fees } = req.body;

      const userId = req.user?.id || 1; // adjust later

      const result = await DoctorAvailabilityService.upsertSlot(
        {
          doctor_id,
          date,
          slot_count,
          fees
        },
        userId
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);

    } catch (error) {

      console.error("CONTROLLER ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });

    }

  }

}

module.exports = DoctorAvailabilityController;