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
    const rawRoleId = req.user?.role_id ?? req.user?.user_type ?? null;
    const rawRoleName = req.user?.role_name ?? req.user?.role ?? null;

    let roleId = null;

    /* resolve numeric role id first */
    if (rawRoleId !== null && rawRoleId !== undefined && !isNaN(Number(rawRoleId))) {
      roleId = Number(rawRoleId);
    }

    /* if role id not found, resolve from role name */
    if (!roleId && typeof rawRoleName === "string") {
      const roleName = rawRoleName.trim().toLowerCase();

      if (roleName === "standard admin") {
        roleId = 2;
      } else if (roleName === "doctor") {
        roleId = 4;
      }
    }

    let adminId = null;
    let doctorId = null;

    if (roleId === 2) {
      adminId =
        req.user?.admin_id ??
        req.user?.ref_id ??
        req.user?.user_id ??
        req.query?.admin_id ??
        null;
    } else if (roleId === 4) {
      doctorId =
        req.user?.doctor_id ??
        req.user?.ref_id ??
        req.user?.user_id ??
        req.query?.doctor_id ??
        null;
    } else {
      return res.sendResponse(
        res.STATUS.BUSINESS_ERROR,
        "This role is not allowed for appointment list",
        {
          received_role_id: rawRoleId ?? null,
          received_role_name: rawRoleName ?? null
        },
        "BUSINESS_ERROR",
        false
      );
    }

    const result = await AppointmentService.getPendingAppointmentsByAdmin(
      adminId,
      roleId,
      doctorId
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
        result.message || "Failed to fetch appointments",
        result.data || [],
        result.errorCode || "BUSINESS_ERROR",
        false
      );
    }

    return res.sendResponse(
      res.STATUS.SUCCESS,
      result.message || "Appointments fetched successfully",
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

  //Appoinment Bokking Status   

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