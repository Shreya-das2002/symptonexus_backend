const express = require("express");
const router = express.Router();

const { savePatientProfile } = require("../controllers/patientDetails.controller");

// ✅ ONLY POST API
router.post("/profile", savePatientProfile);

module.exports = router;
