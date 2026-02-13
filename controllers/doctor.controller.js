const DoctorService = require("../services/doctor.service");
const asyncHandler = require("../utils/asyncHandler");

class DoctorController {

  /* =====================================================
     CREATE DOCTOR
  ===================================================== */
  static createDoctor = asyncHandler(async (req, res) => {
    try {

      const payload = req.body;

      // logged-in user id (admin who creates doctor)
      const createdBy = req.user?.user_id || null;

      const result = await DoctorService.createDoctor(payload, createdBy);

      // Defensive check (VERY IMPORTANT)
      if (!result || typeof result.success !== "boolean") {
        return res.sendResponse(
          res.STATUS.INTERNAL_SERVER_ERROR,
          "Invalid server response",
          {},
          "INVALID_RESPONSE"
        );
      }

      // Business failure (email exists, validation fail, etc.)
      if (!result.success) {
        return res.sendResponse(
          res.STATUS.BUSINESS_ERROR,   // 400
          result.message,
          {},
          result.errorCode || "BUSINESS_ERROR",
          false
        );
      }

      // Success
      return res.sendResponse(
        res.STATUS.SUCCESS,           // 200
        result.message || "Doctor created successfully and pending for approval",
        result.data || {},
        null,
        true
      );

    } catch (error) {

      console.error("CREATE DOCTOR ERROR:", error);

      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Something went wrong. Please try again later.",
        {},
        "SERVER_ERROR"
      );

    }
  });

  /* =====================================================
     GET PENDING DOCTORS
  ===================================================== */
  static getPendingDoctors = asyncHandler(async (req, res) => {

  try {

    const userId = req.user.user_id;
    const role = req.user.role;
    const adminId = req.user.admin_id || req.user.ref_id || null;

    const result = await DoctorService.getPendingDoctors(
      userId,
      adminId,
      role
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
        result.message || "Failed to fetch pending doctors",
        {},
        result.errorCode || "BUSINESS_ERROR",
        false
      );

    }

    return res.sendResponse(
      res.STATUS.SUCCESS,
      "Pending doctors fetched successfully",
      result.data || [],
      null,
      true
    );

  }

  catch (error) {

    console.error("GET PENDING DOCTORS ERROR:", error);

    return res.sendResponse(
      res.STATUS.INTERNAL_SERVER_ERROR,
      "Something went wrong. Please try again later.",
      {},
      "SERVER_ERROR"
    );

  }

});

  /* Update Status */

  static updateDoctorStatus = asyncHandler(async (req, res) => {

  const { doctor_id, status } = req.body;

  const updatedBy = req.user.user_id;

  const result = await DoctorService.updateDoctorStatus(
    doctor_id,
    status,
    updatedBy
  );

  if (!result.success) {

    return res.sendResponse(
      res.STATUS.BUSINESS_ERROR,
      result.message
    );

  }

  return res.sendResponse(
    res.STATUS.SUCCESS,
    result.message,
    result
  );

});

}

module.exports = DoctorController;
