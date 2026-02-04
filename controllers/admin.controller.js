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

}

module.exports = AdminController;
