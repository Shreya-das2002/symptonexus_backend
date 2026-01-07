const express = require('express');
const app = express();
const responseMiddleware = require("./middlewares/response.middleware");

// Load models & sequelize from index.js
const { sequelize, Patient, PatientDetails } = require("./models");

// Other models (just for table creation)
require("./models/User");
require("./models/Admin_user");
require("./models/Doctor");

// Relationships (already defined in index.js but safe to keep)
Patient.hasOne(PatientDetails, { foreignKey: "patient_id" });
PatientDetails.belongsTo(Patient, { foreignKey: "patient_id" });

// Sync database
sequelize.authenticate()
sequelize.sync({ alter: false })
  .then(() => console.log("All tables created / updated"))
  .catch(err => console.error(err));

app.use(express.json());
app.use(responseMiddleware);

// Routes
const registerRoutes = require('./routes/index.routes');
registerRoutes(app);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
