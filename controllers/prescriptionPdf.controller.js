const asyncHandler = require("../utils/asyncHandler");
const PrescriptionPdfService = require("../services/PrescriptionPdf.service");

class PrescriptionPdfController {
  static generatePrescriptionPdf = asyncHandler(async (req, res) => {
    try {
      const { appointment_id, patient_id } = req.body;

      if (!appointment_id) {
        return res.sendResponse(
          res.STATUS.BUSINESS_ERROR,
          "appointment_id is required",
          {},
          "BUSINESS_ERROR",
          false
        );
      }

      if (!patient_id) {
        return res.sendResponse(
          res.STATUS.BUSINESS_ERROR,
          "patient_id is required",
          {},
          "BUSINESS_ERROR",
          false
        );
      }

      const result = await PrescriptionPdfService.generatePrescriptionPdf(
        Number(appointment_id),
        Number(patient_id)
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
          result.message || "Failed to generate prescription PDF",
          {},
          result.errorCode || "BUSINESS_ERROR",
          false
        );
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=prescription_${appointment_id}.pdf`
      );

      return res.end(result.data);
    } catch (error) {
      console.error("PRESCRIPTION PDF CONTROLLER ERROR:", error);

      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Something went wrong. Please try again later.",
        {},
        "SERVER_ERROR"
      );
    }
  });
}

module.exports = PrescriptionPdfController;