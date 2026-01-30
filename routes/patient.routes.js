const express = require("express");
const router = express.Router();

const { getPatientProfile } = require("../controllers/patientDetails.controller");

router.post("/profile", getPatientProfile);

module.exports = router;
