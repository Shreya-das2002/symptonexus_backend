const asyncHandler = require("../utils/asyncHandler");
const DoctorAvailabilityService = require("../services/slotAvailability.service");

class DoctorAvailabilityController {

  upsertSlot = asyncHandler(async (req, res) => {

    try {

      /* ================= BODY ================= */
      const { doctor_id, date, slot_count, fees } = req.body;

      if (!doctor_id || !date || !slot_count || !fees) {
        return res.sendResponse(
          res.STATUS.BUSINESS_ERROR,
          "All fields are required",
          {},
          "VALIDATION_ERROR",
          false
        );
      }

      /* ================= USER ================= */
      const userId = req.user?.user_id || null;

      /* ================= SERVICE ================= */
      const result = await DoctorAvailabilityService.upsertSlot(
        {
          doctor_id,
          date,
          slot_count,
          fees
        },
        userId
      );

      /* ================= RESPONSE CHECK ================= */
      if (!result || typeof result.success !== "boolean") {
        return res.sendResponse(
          res.STATUS.INTERNAL_SERVER_ERROR,
          "Invalid server response",
          {},
          "INVALID_RESPONSE"
        );
      }

      /* ================= BUSINESS ERROR ================= */
      if (!result.success) {
        return res.sendResponse(
          res.STATUS.BUSINESS_ERROR,
          result.message || "Failed to save slot",
          {},
          result.errorCode || "BUSINESS_ERROR",
          false
        );
      }

      /* ================= SUCCESS ================= */
      return res.sendResponse(
        res.STATUS.SUCCESS,
        result.message || "Slot saved successfully",
        result.data || {},
        null,
        true
      );

    } catch (error) {

      console.error("UPSERT SLOT ERROR:", error);

      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        error.message || "Something went wrong. Please try again later.",
        {},
        "SERVER_ERROR"
      );

    }

  });

}

module.exports = new DoctorAvailabilityController();