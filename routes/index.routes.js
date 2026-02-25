const AuthRoutes = require("./auth.route");
const PatientRoutes = require("./patient.routes");
const CreateAdminRoutes = require("./admin.routes");
const DoctorRoutes = require("./doctor.routes");
const applyDoctorRoutes = require("./applyDoctor.routes");
const DoctorProfileRoutes = require("./doctorProfile.routes");
const SlotAvailableRoutes = require("./slotAvailability.routes")

module.exports = (app) => {
  app.use("/api/auth", AuthRoutes);
  app.use("/api/patient", PatientRoutes );
  app.use("/api/admin", CreateAdminRoutes ); 
  app.use("/api/doctor", DoctorRoutes);
  app.use("/api", applyDoctorRoutes);
  app.use("/api/doctor", DoctorProfileRoutes);
  app.use("/api/doctor", SlotAvailableRoutes );
};
