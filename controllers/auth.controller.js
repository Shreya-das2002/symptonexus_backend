const AuthService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");

class AuthController {

  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await AuthService.login(email, password);

    // console.log("CONTROLLER RESULT =>", result);
    // console.log("LOGIN CONTROLLER HIT");

    // if service wants to send business error
    if (!result.success) {
      return res.sendResponse(res.STATUS.BUSINESS_ERROR, result.message);
    }

    return res.sendResponse(res.STATUS.SUCCESS, "", result.data);
  });

  static signupPatient = asyncHandler(async (req, res) => {
    const result = await AuthService.signupPatient(req.body);

    if (!result.success) {
      return res.sendResponse(res.STATUS.BUSINESS_ERROR, result.message);
    }

    return res.sendResponse(res.STATUS.SUCCESS, "", result.data);
  });

}

module.exports = AuthController;
