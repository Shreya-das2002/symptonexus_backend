const AuthRoutes = require("./auth.route");
const patientProfileRoutes = require("./patientProfile.route");


module.exports = (app) => {
  app.use("/api/auth", AuthRoutes);
  app.use("/api/patient", patientProfileRoutes);
};
