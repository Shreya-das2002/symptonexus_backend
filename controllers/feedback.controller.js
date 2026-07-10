const asyncHandler = require("../utils/asyncHandler");
const FeedbackService = require("../services/feedback.service");


class FeedbackController {

  /* ================= CREATE PATIENT FEEDBACK ================= */

  static createPatientFeedback = asyncHandler(async (req, res) => {

    try {

      /* CHECK ONLY PATIENT CAN SUBMIT PATIENT FEEDBACK */

      if (
        !req.user?.role ||
        req.user.role.toLowerCase() !== "patient"
      ) {

        return res.sendResponse(
          res.STATUS.UNAUTHORIZED,
          "Only patient can submit patient feedback",
          {},
          "UNAUTHORIZED",
          false
        );

      }


      /*
       * Get patient ID from logged-in user.
       *
       * In your User table, ref_id normally contains the
       * related patient_id.
       */

      const patientId =
        req.user.patient_id ||
        req.user.ref_id;


      if (!patientId) {

        return res.sendResponse(
          res.STATUS.BUSINESS_ERROR,
          "Patient ID not found in logged-in user",
          {},
          "PATIENT_ID_NOT_FOUND",
          false
        );

      }


      /*
       * Override body patient_id so that one patient cannot
       * submit feedback using another patient's ID.
       */

      const payload = {

        ...req.body,

        patient_id: patientId

      };


      const result =
        await FeedbackService.createPatientFeedback(
          payload
        );


      /* DEFENSIVE RESPONSE CHECK */

      if (
        !result ||
        typeof result.success !== "boolean"
      ) {

        return res.sendResponse(
          res.STATUS.INTERNAL_SERVER_ERROR,
          "Invalid server response",
          {},
          "INVALID_RESPONSE",
          false
        );

      }


      /* BUSINESS ERROR */

      if (!result.success) {

        return res.sendResponse(
          res.STATUS.BUSINESS_ERROR,
          result.message ||
            "Failed to submit patient feedback",
          {},
          result.errorCode || "BUSINESS_ERROR",
          false
        );

      }


      /* SUCCESS */

      return res.sendResponse(
        res.STATUS.SUCCESS,
        result.message ||
          "Patient feedback submitted successfully",
        result.data || {},
        null,
        true
      );

    }

    catch (error) {

      console.error(
        "CREATE PATIENT FEEDBACK CONTROLLER ERROR:",
        error
      );


      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Something went wrong. Please try again later.",
        {},
        "SERVER_ERROR",
        false
      );

    }

  });

}


module.exports = FeedbackController;