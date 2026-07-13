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

/* =====================================================
    CREATE DOCTOR FEEDBACK
===================================================== */

  static createDoctorFeedback = asyncHandler(async (req, res) => {

    try {

      /* CHECK ONLY DOCTOR CAN SUBMIT DOCTOR FEEDBACK */

      if (
        !req.user?.role ||
        req.user.role.toLowerCase() !== "doctor"
      ) {

        return res.sendResponse(
          res.STATUS.UNAUTHORIZED,
          "Only doctor can submit doctor feedback",
          {},
          "UNAUTHORIZED",
          false
        );

      }


      /*
      * Get doctor ID from logged-in user.
      *
      * In your User table, ref_id normally contains the
      * related doctor_id.
      */

      const doctorId =
        req.user.doctor_id ||
        req.user.ref_id;


      if (!doctorId) {

        return res.sendResponse(
          res.STATUS.BUSINESS_ERROR,
          "Doctor ID not found in logged-in user",
          {},
          "DOCTOR_ID_NOT_FOUND",
          false
        );

      }


      /*
      * Override body doctor_id so that one doctor cannot
      * submit feedback using another doctor's ID.
      */

      const payload = {

        ...req.body,

        doctor_id: doctorId

      };


      const result =
        await FeedbackService.createDoctorFeedback(
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
            "Failed to submit doctor feedback",
          {},
          result.errorCode || "BUSINESS_ERROR",
          false
        );

      }


      /* SUCCESS */

      return res.sendResponse(
        res.STATUS.SUCCESS,
        result.message ||
          "Doctor feedback submitted successfully",
        result.data || {},
        null,
        true
      );

    }

    catch (error) {

      console.error(
        "CREATE DOCTOR FEEDBACK CONTROLLER ERROR:",
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

    /* ================= GET ALL PATIENT FEEDBACKS ================= */

  static getAllPatientFeedbacks = asyncHandler(async (req, res) => {
    try {
      const result = await FeedbackService.getAllPatientFeedbacks();

      /* DEFENSIVE RESPONSE CHECK */

      if (!result || typeof result.success !== "boolean") {
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
          result.message || "Failed to fetch patient feedback list",
          {},
          result.errorCode || "BUSINESS_ERROR",
          false
        );
      }

      /* SUCCESS */

      return res.sendResponse(
        res.STATUS.SUCCESS,
        result.message || "Patient feedback list fetched successfully",
        result.data || [],
        null,
        true
      );
    } catch (error) {
      console.error("GET ALL PATIENT FEEDBACKS CONTROLLER ERROR:", error);

      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Something went wrong. Please try again later.",
        {},
        "SERVER_ERROR",
        false
      );
    }
  });

  /* ================= GET ALL DOCTOR FEEDBACKS ================= */

  static getAllDoctorFeedbacks = asyncHandler(async (req, res) => {
    try {
      const result = await FeedbackService.getAllDoctorFeedbacks();

      /* DEFENSIVE RESPONSE CHECK */

      if (!result || typeof result.success !== "boolean") {
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
          result.message || "Failed to fetch doctor feedback list",
          {},
          result.errorCode || "BUSINESS_ERROR",
          false
        );
      }

      /* SUCCESS */

      return res.sendResponse(
        res.STATUS.SUCCESS,
        result.message || "Doctor feedback list fetched successfully",
        result.data || [],
        null,
        true
      );
    } catch (error) {
      console.error("GET ALL DOCTOR FEEDBACKS CONTROLLER ERROR:", error);

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