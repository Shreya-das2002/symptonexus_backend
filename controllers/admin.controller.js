const asyncHandler = require("../utils/asyncHandler");
const AdminService = require("../services/admin.service");

class AdminController {

  /* ===================== CREATE ADMIN ===================== */
  static createAdmin = asyncHandler(async (req, res) => {

    try {

      const result = await AdminService.createAdmin(
        req.body,
        req.user?.user_id
      );

      // Defensive check
      if (!result || typeof result.success !== "boolean") {
        return res.sendResponse(
          res.STATUS.INTERNAL_SERVER_ERROR,
          "Invalid server response",
          {},
          "INVALID_RESPONSE"
        );
      }

      // Business error
      if (!result.success) {
        return res.sendResponse(
          res.STATUS.BUSINESS_ERROR,
          result.message || "Failed to create admin",
          {},
          result.errorCode || "BUSINESS_ERROR",
          false
        );
      }

      // Success
      return res.sendResponse(
        res.STATUS.SUCCESS,
        result.message || "Admin created successfully",
        result.data || {},
        null,
        true
      );

    } catch (error) {

      console.error("CREATE ADMIN CONTROLLER ERROR:", error);

      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Something went wrong. Please try again later.",
        {},
        "SERVER_ERROR"
      );

    }

  });


  /* ===================== GET ALL ADMINS ===================== */
  static getAllAdmins = asyncHandler(async (req, res) => {

    try {

      const result = await AdminService.getAllAdmins();

      // Defensive check
      if (!result || typeof result.success !== "boolean") {
        return res.sendResponse(
          res.STATUS.INTERNAL_SERVER_ERROR,
          "Invalid server response",
          {},
          "INVALID_RESPONSE"
        );
      }

      // Business error
      if (!result.success) {
        return res.sendResponse(
          res.STATUS.BUSINESS_ERROR,
          result.message || "Failed to fetch admins",
          {},
          result.errorCode || "BUSINESS_ERROR",
          false
        );
      }

      // Success
      return res.sendResponse(
        res.STATUS.SUCCESS,
        result.message || "Admins fetched successfully",
        result.data || [],
        null,
        true
      );

    } catch (error) {

      console.error("GET ALL ADMINS CONTROLLER ERROR:", error);

      return res.sendResponse(
        res.STATUS.INTERNAL_SERVER_ERROR,
        "Something went wrong. Please try again later.",
        {},
        "SERVER_ERROR"
      );

    }

  });

}

module.exports = AdminController;
