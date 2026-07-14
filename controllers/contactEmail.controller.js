const asyncHandler = require("../utils/asyncHandler");
const ContactEmailService = require("../services/contactEmail.service");

/* ================= CONTROLLER ================= */

class ContactEmailController {
  static sendContactMessage = asyncHandler(async (req, res) => {
    try {
      const result = await ContactEmailService.sendContactMessage(req.body);

      return res.sendResponse(
        res.STATUS.SUCCESS,
        result.message || "Contact message sent successfully",
        {},
        null,
        true
      );
    } catch (error) {
      console.error("CONTACT_EMAIL_CONTROLLER_ERROR:", error);

      if (error.message === "ALL_FIELDS_REQUIRED") {
        return res.sendResponse(
          res.STATUS.BUSINESS_ERROR,
          "Name, email and message are required",
          {},
          "ALL_FIELDS_REQUIRED",
          false
        );
      }

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

module.exports = ContactEmailController;