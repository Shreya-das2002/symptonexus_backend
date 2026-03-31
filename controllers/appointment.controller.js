const AppointmentService = require("../services/appointment.service");
const asyncHandler = require("../utils/asyncHandler");

class AppointmentController {

  /* =====================================================
     CREATE APPOINTMENT
  ===================================================== */
  static createAppointment = asyncHandler(async (req, res) => {
    try {

      const payload = req.body;

      const createdBy = req.user?.patient_id || req.body.patient_id || null;

      const result = await AppointmentService.createAppointment(
        payload,
        createdBy
      );

      if (!result || typeof result.success !== "boolean") {
        return res.sendResponse(
          res.STATUS.INTERNAL_SERVER_ERROR,
          "Invalid server response",
          {},
          "INVALID_RESPONSE"
        );
      }

      if (!result.success) {
        return res.sendResponse(
          res.STATUS.BUSINESS_ERROR,
          result.message || "Failed to book appointment",
          {},
          result.errorCode || "BUSINESS_ERROR",
          false
        );
      }

      return res.sendResponse(
        res.STATUS.SUCCESS,
        result.message || "Appointment booked successfully",
        result.data || {},
        null,
        true
      );

    } catch (error) {

      console.error("CREATE APPOINTMENT ERROR:", error);

      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Something went wrong. Please try again later.",
        {},
        "SERVER_ERROR"
      );

    }
  });

  // All appointments list

  static async getAllAppointments(req, res) {
  try {

    const result = await AppointmentService.getAllAppointments();

    return res.status(200).json(result);

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
}

}

module.exports = AppointmentController;