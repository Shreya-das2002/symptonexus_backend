const AuthService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");

class AuthController {

  // ===================== LOGIN =====================
  static login = asyncHandler(async (req, res) => {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      //  Defensive check (VERY IMPORTANT)
      if (!result || typeof result.success !== "boolean") {
        return res.sendResponse(
          res.STATUS.INTERNAL_SERVER_ERROR,
          "Invalid server response",
          {}
        );
      }

      return res.sendResponse(
        result.success ? res.STATUS.SUCCESS : res.STATUS.BUSINESS_ERROR,
        result.message || "",
        result.data || {},
        result.errorCode || null
      );

    } catch (error) {
      console.error("LOGIN ERROR:", error);

      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Something went wrong. Please try again.",
        {}
      );
    }
  });

  // ===================== SIGNUP =====================
  static signupPatient = asyncHandler(async (req, res) => {
    try {
      const result = await AuthService.signupPatient(req.body);

      // 🔐 Defensive check
      if (!result || typeof result.success !== "boolean") {
        return res.sendResponse(
          res.STATUS.INTERNAL_SERVER_ERROR,
          "Invalid server response",
          {}
        );
      }

      if (!result.success) {
        return res.sendResponse(
          res.STATUS.BUSINESS_ERROR,
          result.message || "Signup failed",
          {}
        );
      }

      return res.sendResponse(
        res.STATUS.SUCCESS,
        "Signup successful",
        result.data || {}
      );

    } catch (error) {
      console.error("Signup Patient Error:", error);

      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Something went wrong. Please try again later.",
        {}
      );
    }
  });

}

module.exports = AuthController;
