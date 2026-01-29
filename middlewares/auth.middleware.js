const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    /* ================= HEADER CHECK ================= */
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.sendResponse(
        res.STATUS.UNAUTHORIZED,
        "Authorization token missing"
      );
    }

    /* ================= TOKEN EXTRACT ================= */
    const token = authHeader.split(" ")[1];

    /* ================= JWT VERIFY ================= */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /* ================= PAYLOAD VERIFY ================= */

    // Must-have fields
    if (!decoded.user_id || !decoded.role) {
      return res.sendResponse(
        res.STATUS.UNAUTHORIZED,
        "Invalid token payload"
      );
    }

    // Role-specific validation
    if (decoded.role === "patient" && !decoded.patient_id) {
      return res.sendResponse(
        res.STATUS.UNAUTHORIZED,
        "Invalid patient token"
      );
    }

    if (decoded.role === "doctor" && !decoded.doctor_id) {
      return res.sendResponse(
        res.STATUS.UNAUTHORIZED,
        "Invalid doctor token"
      );
    }

    if (decoded.role.includes("admin") && !decoded.admin_id) {
      return res.sendResponse(
        res.STATUS.UNAUTHORIZED,
        "Invalid admin token"
      );
    }

    /* ================= ATTACH USER ================= */
    req.user = decoded;

    next();

  } catch (error) {
    return res.sendResponse(
      res.STATUS.UNAUTHORIZED,
      "Invalid or expired token"
    );
  }
};
