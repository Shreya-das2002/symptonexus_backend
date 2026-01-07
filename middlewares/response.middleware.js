const STATUS = require("../constants/statusCodes");

module.exports = (req, res, next) => {
  res.sendResponse = (status, error_message = "", data = {}) => {
    return res.status(status).json({
      status,
      error_message,
      data
    });
  };

  // attach status constants also
  res.STATUS = STATUS;

  next();
};