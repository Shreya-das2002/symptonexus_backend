const AuthRoutes = require("./auth.route");
const PatientRoutes = require("./patient.routes");
const CreateAdminRoutes = require("./admin.routes");
const DoctorRoutes = require("./doctor.routes");
const applyDoctorRoutes = require("./applyDoctor.routes");

module.exports = (app) => {
  app.use("/api/auth", AuthRoutes);
  app.use("/api/patient", PatientRoutes );
  app.use("/api/admin", CreateAdminRoutes ); 
  app.use("/api/doctor", DoctorRoutes);
  app.use("/api", applyDoctorRoutes);
};
