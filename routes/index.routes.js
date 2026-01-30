const { savePatientProfile } = require("../controllers/patientDetails.controller");
const AuthRoutes = require("./auth.route");
const PatientRoutes = require("./patient.routes");


module.exports = (app) => {
  app.use("/api/auth", AuthRoutes);
  app.use("/api/patient", PatientRoutes );
};
