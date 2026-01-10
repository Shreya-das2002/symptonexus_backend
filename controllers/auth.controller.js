const AuthService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");

class AuthController {

  static login = asyncHandler(async (req, res) => {
  console.time("TOTAL");

  console.time("SERVICE");
  const result = await AuthService.login(req.body.email, req.body.password);
  console.timeEnd("SERVICE");

  console.time("RESPONSE");
  const response = res.sendResponse(
    result.success ? res.STATUS.SUCCESS : res.STATUS.BUSINESS_ERROR,
    result.message || "",
    result.data || {}
  );
  console.timeEnd("RESPONSE");

  console.timeEnd("TOTAL");
  return response;
});

  static signupPatient = asyncHandler(async (req, res) => {
  const result = await AuthService.signupPatient(req.body);

  if (!result.success) {
    return res.sendResponse(res.STATUS.BUSINESS_ERROR, result.message);
  }

  return res.sendResponse(res.STATUS.SUCCESS, "", result);
});
}
module.exports = AuthController;
