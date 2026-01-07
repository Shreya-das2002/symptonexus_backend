const AuthRoutes = require("./auth.route");

module.exports = (app) => {
  app.use("/api/auth", AuthRoutes);
};
