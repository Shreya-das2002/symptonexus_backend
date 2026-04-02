const AppointmentService = require("../services/appointment.service");
const asyncHandler = require("../utils/asyncHandler");

class AppointmentController {

  /* =====================================================
     CREATE APPOINTMENT
  ===================================================== */
  static createAppointment = asyncHandler(async (req, res) => {
    try {

      const payload = req.body;

      const createdBy = req.user?.user_id || null;

      const result = await AppointmentService.createAppointment(payload, createdBy);

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
          result.message || "Failed to create appointment",
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

      console.error("CREATE APPOINTMENT CONTROLLER ERROR:", error);

      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Something went wrong. Please try again later.",
        {},
        "SERVER_ERROR"
      );

    }
  });

  /* =====================================================
     GET ALL APPOINTMENTS
  ===================================================== */
  static getAllAppointments = asyncHandler(async (req, res) => {
    try {

      const result = await AppointmentService.getAllAppointments();

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
          result.message || "Failed to fetch appointments",
          {},
          result.errorCode || "BUSINESS_ERROR",
          false
        );
      }

      return res.sendResponse(
        res.STATUS.SUCCESS,
        "Appointments fetched successfully",
        result.data || [],
        null,
        true
      );

    } catch (error) {

      console.error("GET ALL APPOINTMENTS CONTROLLER ERROR:", error);

      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Something went wrong. Please try again later.",
        {},
        "SERVER_ERROR"
      );

    }
  });

  /* =====================================================
     GET PENDING APPOINTMENTS FOR STANDARD ADMIN
  ===================================================== */
  static getPendingAppointmentsByAdmin = asyncHandler(async (req, res) => {
    try {

      const adminId =
        req.user?.admin_id ||
        req.user?.ref_id ||
        req.query?.admin_id ||
        null;

      const result =
        await AppointmentService.getPendingAppointmentsByAdmin(adminId);

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
          result.message || "Failed to fetch pending appointments",
          {},
          result.errorCode || "BUSINESS_ERROR",
          false
        );
      }

      return res.sendResponse(
        res.STATUS.SUCCESS,
        result.message || "Pending appointments fetched successfully",
        result.data || [],
        null,
        true
      );

    } catch (error) {

      console.error("GET PENDING APPOINTMENTS CONTROLLER ERROR:", error);

      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Something went wrong. Please try again later.",
        {},
        "SERVER_ERROR"
      );

    }
  });

  //Appoinment Bokking Status update  

static updateAppointmentStatus = asyncHandler(async (req, res) => {
  try {

    const { appointment_id, action } = req.body;

    if (!appointment_id || !action) {
      return res.sendResponse(
        res.STATUS.BUSINESS_ERROR,
        "appointment_id and action are required",
        {},
        "BUSINESS_ERROR",
        false
      );
    }

    const updatedBy =
      req.user?.admin_id ||
      req.user?.user_id ||
      req.body.updated_by ||
      null;

    const result = await AppointmentService.updateAppointmentStatus(
      Number(appointment_id),
      action,
      updatedBy
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
        result.message || "Failed to update appointment status",
        {},
        result.errorCode || "BUSINESS_ERROR",
        false
      );
    }

    return res.sendResponse(
      res.STATUS.SUCCESS,
      result.message || "Appointment status updated successfully",
      result.data || {},
      null,
      true
    );

  } catch (error) {

    console.error("UPDATE APPOINTMENT STATUS CONTROLLER ERROR:", error);

    return res.sendResponse(
      res.STATUS.INTERNAL_SERVER_ERROR,
      "Something went wrong. Please try again later.",
      {},
      "SERVER_ERROR"
    );

  }
});

}

module.exports = AppointmentController;