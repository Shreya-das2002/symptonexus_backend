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

      const result =
        await DoctorService.getPendingDoctors();

      // Defensive check
      if (!result || typeof result.success !== "boolean") {

        return res.sendResponse(
          res.STATUS.INTERNAL_SERVER_ERROR,
          "Invalid server response",
          {},
          "INVALID_RESPONSE"
        );

      }

      // Business failure
      if (!result.success) {

        return res.sendResponse(
          res.STATUS.BUSINESS_ERROR,
          result.message || "Failed to fetch pending doctors",
          {},
          result.errorCode || "BUSINESS_ERROR",
          false
        );

      }

      // Success
      return res.sendResponse(
        res.STATUS.SUCCESS,
        result.message || "Pending doctors fetched successfully",
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


}

module.exports = DoctorController;
