const asyncHandler = require("../utils/asyncHandler");
const AdminService = require("../services/admin.service");
const admin_user = require("../models/Admin_user");
const User = require("../models/User");
const DomainLookup = require("../models/Domain_lookup")

class AdminController {

  /* ===================== CREATE ADMIN ===================== */
  static createAdmin = asyncHandler(async (req, res) => {
    try {
      const result = await AdminService.createAdmin(
        req.body,
        req.user?.user_id
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);

    } catch (error) {
      console.error("CREATE ADMIN CONTROLLER ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

   // GET ALL ADMINS (STATIC + ASYNC + TRY-CATCH)
static getAllAdmins = async (req, res) => {
  try {
    const admins = await AdminService.getAllAdmins();

    return res.status(200).json({
      success: true,
      data: admins
    });
  } catch (error) {
    console.error("GET ALL ADMINS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
  }



module.exports = AdminController;
