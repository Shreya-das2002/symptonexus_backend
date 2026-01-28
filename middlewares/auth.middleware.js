const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.sendResponse(
        res.STATUS.UNAUTHORIZED,
        "Token missing"
      );
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // patient_id available
    next();

  } catch (err) {
    return res.sendResponse(
      res.STATUS.UNAUTHORIZED,
      "Invalid or expired token"
    );
  }
};
